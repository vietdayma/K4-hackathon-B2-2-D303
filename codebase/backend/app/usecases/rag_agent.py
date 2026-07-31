import re
import random
from typing import List, Optional, Dict, Set
from app.core.entities import Question, Citation, ExplainResponse, QuizResponse
from app.infrastructure.transcript_loader import TranscriptLoader
from app.infrastructure.slide_loader import SlideLoader
from app.infrastructure.quiz_loader import QuizLoader
from app.interfaces.external.gemini_client import GeminiClient

class RagAgentUseCase:
    def __init__(
        self,
        transcript_loader: TranscriptLoader,
        slide_loader: SlideLoader,
        quiz_loader: QuizLoader,
        gemini_client: GeminiClient
    ):
        self.transcript_loader = transcript_loader
        self.slide_loader = slide_loader
        self.quiz_loader = quiz_loader
        self.gemini_client = gemini_client
        print("[RAG_AGENT_USECASE] RagAgentUseCase initialized.")

    TOTAL_QUIZ_COUNT = 10

    def _sample_questions(self, pool: List[Dict], count: int, exclude_ids: Set[str]) -> List[Dict]:
        """Lấy ngẫu nhiên count câu hỏi từ pool, loại trừ các ID đã chọn."""
        available = [q for q in pool if q["id"] not in exclude_ids]
        if not available or count <= 0:
            return []
        sample_size = min(count, len(available))
        return random.sample(available, sample_size)

    def _select_quiz_questions(
        self,
        awareness_level: int,
        vague_knowledge: Optional[str] = None
    ) -> List[Dict]:
        """
        Chọn 10 câu hỏi:
        - 6-7 câu ngẫu nhiên đúng mức độ nhận biết (trọng số) được truyền vào
        - Nếu có vague_knowledge và level > 1: thêm 3-4 câu ở mức thấp hơn,
          ưu tiên câu liên quan kiến thức mơ hồ (Gemini xếp hạng)
        - Nếu không có vague_knowledge: 10 câu ngẫu nhiên đúng mức độ nhận biết (không lấy mức thấp hơn)
        """
        questions_at_level = self.quiz_loader.get_questions_by_level(awareness_level)
        print(f"[RAG_AGENT_USECASE] Found {len(questions_at_level)} questions at level {awareness_level}")

        if not questions_at_level:
            print("[RAG_AGENT_USECASE] WARNING: No questions found for the given level.")
            return []

        selected: List[Dict] = []
        selected_ids: Set[str] = set()
        has_vague_knowledge = bool(vague_knowledge and vague_knowledge.strip())

        if has_vague_knowledge and awareness_level > 1:
            main_count = random.randint(6, 7)
            lower_count = self.TOTAL_QUIZ_COUNT - main_count

            selected.extend(self._sample_questions(questions_at_level, main_count, selected_ids))
            selected_ids.update(q["id"] for q in selected)
            print(f"[RAG_AGENT_USECASE] Picked {len(selected)} questions at level {awareness_level} (target {main_count})")

            lower_pool = self.quiz_loader.get_questions_below_level(awareness_level)
            print(f"[RAG_AGENT_USECASE] Found {len(lower_pool)} questions below level {awareness_level}")

            lower_selected: List[Dict] = []
            if lower_pool:
                print(f"[RAG_AGENT_USECASE] Ranking lower-level questions for vague knowledge: '{vague_knowledge}'")
                ranked_ids = self.gemini_client.filter_and_rank_questions(
                    questions=lower_pool,
                    vague_knowledge=vague_knowledge,
                    limit=lower_count
                )
                for q_id in ranked_ids:
                    q = self.quiz_loader.get_question_by_id(q_id)
                    if q and q["id"] not in selected_ids:
                        lower_selected.append(q)
                        selected_ids.add(q["id"])
                    if len(lower_selected) >= lower_count:
                        break

                if len(lower_selected) < lower_count:
                    extra = self._sample_questions(
                        lower_pool,
                        lower_count - len(lower_selected),
                        selected_ids
                    )
                    lower_selected.extend(extra)
                    selected_ids.update(q["id"] for q in extra)

            selected.extend(lower_selected)
            print(f"[RAG_AGENT_USECASE] Picked {len(lower_selected)} lower-level questions (target {lower_count})")
        else:
            selected = self._sample_questions(
                questions_at_level,
                self.TOTAL_QUIZ_COUNT,
                set()
            )
            selected_ids.update(q["id"] for q in selected)
            print(f"[RAG_AGENT_USECASE] Picked {len(selected)} random questions at level {awareness_level}")

        if len(selected) < self.TOTAL_QUIZ_COUNT:
            need = self.TOTAL_QUIZ_COUNT - len(selected)
            extra = self._sample_questions(questions_at_level, need, selected_ids)
            selected.extend(extra)
            print(f"[RAG_AGENT_USECASE] Filled {len(extra)} extra questions from level {awareness_level}")

        random.shuffle(selected)
        return selected[:self.TOTAL_QUIZ_COUNT]

    def get_recommended_quizzes(
        self,
        awareness_level: int,
        vague_knowledge: Optional[str] = None
    ) -> QuizResponse:
        """
        Lấy 10 câu hỏi ôn tập theo trọng số mức độ nhận biết.
        Nếu có vague_knowledge: validate trước (chống prompt injection),
        không hợp lệ thì trả gợi ý topic thay vì câu hỏi sai lệch.
        """
        print(f"\n[RAG_AGENT_USECASE] Request: level={awareness_level}, vague_knowledge='{vague_knowledge}'")

        normalized_vague = vague_knowledge.strip() if vague_knowledge else None
        if normalized_vague == "":
            normalized_vague = None

        if normalized_vague:
            validation = self.gemini_client.validate_vague_knowledge(
                vague_knowledge=normalized_vague,
                available_topics=self.quiz_loader.get_available_topics(),
                course_name=self.quiz_loader.metadata.get("course", "AI Thực Chiến"),
            )
            if not validation.get("is_valid"):
                return QuizResponse(
                    status="clarification_needed",
                    message=validation.get("message"),
                    suggested_topics=validation.get("suggested_topics", []),
                )

        selected_questions = self._select_quiz_questions(awareness_level, normalized_vague)
        if not selected_questions:
            return QuizResponse(
                status="clarification_needed",
                message=f"Không tìm thấy câu hỏi ở mức độ nhận biết {awareness_level}. Bạn thử chọn mức khác hoặc mô tả chủ đề cụ thể hơn.",
                suggested_topics=self.quiz_loader.get_available_topics(),
            )

        print(f"[RAG_AGENT_USECASE] Selected {len(selected_questions)} questions for candidate list.")

        # 3. Với mỗi câu hỏi, thực hiện RAG để tìm trích dẫn chi tiết
        final_questions: List[Question] = []
        for q_data in selected_questions:
            citations: List[Citation] = []
            explanation = q_data.get("explanation", "")
            
            # Tìm mã đoạn [Txx-NNN] trong phần giải thích (explanation)
            # Ví dụ: "Cấu trúc vòng tròn bao phủ... [T04-015]."
            chunk_ids = re.findall(r'\[(T\d{2}-\d{3})\]', explanation)
            print(f"[RAG_AGENT_USECASE] Question {q_data['id']} - Found chunk IDs in explanation: {chunk_ids}")

            if chunk_ids:
                for chunk_id in chunk_ids:
                    chunk = self.transcript_loader.get_chunk(chunk_id)
                    if chunk:
                        # Xác định file slide PDF tương ứng
                        # Day 1: T04, T06 -> d1-slide-hackathon.pdf
                        # Day 2: T01, T02, T03, T05 -> d2-slide-hackathon.pdf
                        slide_file = "d2-slide-hackathon.pdf"
                        if chunk_id.startswith("T04") or chunk_id.startswith("T06"):
                            slide_file = "d1-slide-hackathon.pdf"

                        # Lấy danh sách các trang slide thuộc file PDF này
                        all_slides = self.slide_loader.get_all_slides()
                        filtered_slides = [s for s in all_slides if s["file_name"] == slide_file]

                        print(f"[RAG_AGENT_USECASE] Finding slide page for {chunk_id} in {slide_file} ({len(filtered_slides)} pages)")
                        
                        # Gọi Gemini để đối chiếu tìm trang slide liên quan nhất
                        slide_citation = self.gemini_client.find_slide_citation(
                            question_text=q_data["question"],
                            explanation=explanation,
                            transcript_text=chunk["text"],
                            slide_file=slide_file,
                            slides=filtered_slides
                        )
                        
                        citations.append(Citation(
                            chunk_id=chunk_id,
                            source_file=chunk["source_file"],
                            slide_file=slide_citation.get("slide_file"),
                            slide_page=slide_citation.get("slide_page"),
                            quote=chunk["text"]
                        ))
                    else:
                        print(f"[RAG_AGENT_USECASE] WARNING: Chunk {chunk_id} not found in transcript loader.")
            else:
                # Nếu không tìm thấy mã đoạn [Txx-NNN] trong giải thích,
                # thực hiện tìm kiếm từ khóa/ngữ nghĩa đơn giản trong transcript
                print(f"[RAG_AGENT_USECASE] No explicit chunk ID found in explanation of {q_data['id']}. Doing fallback search.")
                fallback_chunks = self.transcript_loader.search_chunks(q_data["question"], limit=1)
                if fallback_chunks:
                    chunk = fallback_chunks[0]
                    chunk_id = chunk["chunk_id"]
                    
                    slide_file = "d2-slide-hackathon.pdf"
                    if chunk_id.startswith("T04") or chunk_id.startswith("T06"):
                        slide_file = "d1-slide-hackathon.pdf"
                        
                    all_slides = self.slide_loader.get_all_slides()
                    filtered_slides = [s for s in all_slides if s["file_name"] == slide_file]
                    
                    slide_citation = self.gemini_client.find_slide_citation(
                        question_text=q_data["question"],
                        explanation=explanation,
                        transcript_text=chunk["text"],
                        slide_file=slide_file,
                        slides=filtered_slides
                    )
                    
                    citations.append(Citation(
                        chunk_id=chunk_id,
                        source_file=chunk["source_file"],
                        slide_file=slide_citation.get("slide_file"),
                        slide_page=slide_citation.get("slide_page"),
                        quote=chunk["text"]
                    ))

            # Đóng gói Question thực thể
            question_obj = Question(
                id=q_data["id"],
                topic=q_data["topic"],
                level=q_data["level"],
                level_description=q_data["level_description"],
                question=q_data["question"],
                options=q_data["options"],
                answer=q_data["answer"],
                explanation=explanation,
                citations=citations
            )
            final_questions.append(question_obj)

        print(f"[RAG_AGENT_USECASE] Completed processing {len(final_questions)} questions.\n")
        return QuizResponse(status="success", questions=final_questions)

    def explain_user_question(
        self,
        question_text: str,
        options: Optional[List[str]] = None,
        user_answer: Optional[str] = None
    ) -> ExplainResponse:
        """
        Dựa trên transcript bài giảng, giải thích câu trả lời đúng cho học viên,
        đồng thời xác định nguồn trích dẫn slide/transcript liên quan.
        """
        print(f"\n[RAG_AGENT_USECASE] Explain Request: '{question_text}' (User Answer: {user_answer})")
        
        # 1. Tìm kiếm các đoạn transcript liên quan nhất để làm ngữ cảnh
        related_chunks = self.transcript_loader.search_chunks(question_text, limit=10)
        print(f"[RAG_AGENT_USECASE] Found {len(related_chunks)} relevant transcript chunks for context.")
        
        # Ghép các đoạn transcript thành ngữ cảnh
        context_parts = []
        for c in related_chunks:
            context_parts.append(f"[{c['chunk_id']}] ({c['topic']}): {c['text']}")
        transcript_context = "\n\n".join(context_parts)

        # 2. Gọi Gemini giải thích dựa trên ngữ cảnh này
        explain_result = self.gemini_client.explain_question(
            question_text=question_text,
            options=options or [],
            transcript_context=transcript_context
        )

        # 3. Xử lý và bổ sung thông tin slide cho các citations từ Gemini
        citations: List[Citation] = []
        gemini_citations = explain_result.get("citations", [])
        
        for gc in gemini_citations:
            chunk_id = gc.get("chunk_id")
            quote = gc.get("quote", "")
            
            # Tìm thông tin gốc của chunk trong loader
            chunk = self.transcript_loader.get_chunk(chunk_id)
            source_file = chunk["source_file"] if chunk else "unknown_transcript.md"
            quote_text = chunk["text"] if chunk else quote
            
            # Xác định slide file tương ứng
            slide_file = "d2-slide-hackathon.pdf"
            if chunk_id and (chunk_id.startswith("T04") or chunk_id.startswith("T06")):
                slide_file = "d1-slide-hackathon.pdf"
                
            # Lọc slide tương ứng và gọi Gemini tìm trang slide
            all_slides = self.slide_loader.get_all_slides()
            filtered_slides = [s for s in all_slides if s["file_name"] == slide_file]
            
            slide_citation = self.gemini_client.find_slide_citation(
                question_text=question_text,
                explanation=explain_result.get("explanation", ""),
                transcript_text=quote_text,
                slide_file=slide_file,
                slides=filtered_slides
            )
            
            citations.append(Citation(
                chunk_id=chunk_id or "unknown",
                source_file=source_file,
                slide_file=slide_file,
                slide_page=slide_citation.get("slide_page"),
                quote=quote_text
            ))

        response = ExplainResponse(
            correct_answer=explain_result.get("correct_answer", "N/A"),
            explanation=explain_result.get("explanation", "Không thể tạo giải thích."),
            citations=citations
        )
        print(f"[RAG_AGENT_USECASE] Explain Request completed.\n")
        return response

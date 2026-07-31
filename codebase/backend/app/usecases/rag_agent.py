import re
import random
from typing import List, Optional, Dict, Set
from app.core.entities import (
    Question, 
    Citation, 
    ExplainResponse, 
    QuizResponse, 
    HintResponse, 
    SocraticChatResponse
)
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
        available = [q for q in pool if q["id"] not in exclude_ids]
        if not available or count <= 0:
            return []
        sample_size = min(count, len(available))
        return random.sample(available, sample_size)

    def _select_quiz_questions(
        self,
        awareness_level: int,
        vague_knowledge: Optional[str] = None,
        matched_topic: Optional[str] = None
    ) -> List[Dict]:
        """
        Lựa chọn 10 câu hỏi theo quy tắc:
        - 3-4 câu thuộc CHÍNH XÁC matched_topic ở Level THẤP HƠN awareness_level.
        - 6-7 câu ở đúng awareness_level hiện tại KHÔNG TRÙNG VỚI matched_topic (Random các topic khác).
        """
        questions_at_level = self.quiz_loader.get_questions_by_level(awareness_level)
        if not questions_at_level:
            return []

        selected: List[Dict] = []
        selected_ids: Set[str] = set()

        # Nếu matched_topic bị None -> Tự động ánh xạ fallback từ vague_knowledge
        effective_topic = matched_topic
        if not effective_topic and vague_knowledge:
            norm_v = self.gemini_client._normalize_vn(vague_knowledge)
            if "prompt" in norm_v or "context" in norm_v:
                effective_topic = "Prompt Engineering & Context Management"
            elif "llm" in norm_v or "token" in norm_v:
                effective_topic = "Cơ chế LLM & Token"
            elif "transformer" in norm_v:
                effective_topic = "Kiến trúc Transformer"
            elif "agent" in norm_v:
                effective_topic = "Ứng dụng & Kỹ nghệ AI Agent"
            elif "api" in norm_v:
                effective_topic = "API & Hyperparameters"
            elif "lich su" in norm_v:
                effective_topic = "Lịch sử & Concept AI"

        norm_target = self.gemini_client._normalize_vn(effective_topic) if effective_topic else ""

        # TRƯỜNG HỢP 1: CÓ MƠ HỒ VÀ LEVEL > 1
        if vague_knowledge and awareness_level > 1:
            lower_target_count = random.randint(3, 4) # Mục tiêu 3-4 câu level thấp

            lower_pool = self.quiz_loader.get_questions_below_level(awareness_level)
            
            # 1. LỌC CHÍNH XÁC CÁC CÂU THUỘC MATCHED_TOPIC Ở LEVEL THẤP HƠN
            matched_lower = [
                q for q in lower_pool 
                if norm_target and (norm_target in self.gemini_client._normalize_vn(q.get("topic", "")) or 
                                    self.gemini_client._normalize_vn(q.get("topic", "")) in norm_target)
            ]

            print(f"[RAG_AGENT_USECASE] Target Topic: '{effective_topic}' -> Found {len(matched_lower)} lower-level questions.")

            # Bốc đúng 3-4 câu của matched_topic ở Level thấp
            if matched_lower:
                picked_lower = self._sample_questions(matched_lower, min(len(matched_lower), lower_target_count), selected_ids)
                selected.extend(picked_lower)
                selected_ids.update(q["id"] for q in picked_lower)

            # 2. LẤY SỐ CÂU CÒN LẠI Ở LEVEL HIỆN TẠI - LOẠI BỎ HOÀN TOÀN MATCHED_TOPIC
            need_main = self.TOTAL_QUIZ_COUNT - len(selected)

            # Bộ lọc LOẠI TRỪ matched_topic ra khỏi danh sách câu hỏi Level 3
            other_topics_at_level = [
                q for q in questions_at_level
                if not (
                    norm_target and (norm_target in self.gemini_client._normalize_vn(q.get("topic", "")) or
                                     self.gemini_client._normalize_vn(q.get("topic", "")) in norm_target)
                )
            ]

            # Bốc ngẫu nhiên các câu Level hiện tại của CÁC CHỦ ĐỀ KHÁC
            main_picked = self._sample_questions(other_topics_at_level, need_main, selected_ids)
            selected.extend(main_picked)
            selected_ids.update(q["id"] for q in main_picked)

        else:
            # TRƯỜNG HỢP 2: KHÔNG CÓ MƠ HỒ HOẶC LEVEL = 1
            selected = self._sample_questions(questions_at_level, self.TOTAL_QUIZ_COUNT, set())
            selected_ids.update(q["id"] for q in selected)

        # 3. LẤP ĐẦY ĐỦ 10 CÂU NẾU VẪN THIẾU
        if len(selected) < self.TOTAL_QUIZ_COUNT:
            need_fill = self.TOTAL_QUIZ_COUNT - len(selected)
            fill_questions = self._sample_questions(questions_at_level, need_fill, selected_ids)
            selected.extend(fill_questions)
            selected_ids.update(q["id"] for q in fill_questions)

        random.shuffle(selected)
        return selected[:self.TOTAL_QUIZ_COUNT]

    def get_recommended_quizzes(
        self,
        awareness_level: int,
        vague_knowledge: Optional[str] = None
    ) -> QuizResponse:
        print(f"\n[RAG_AGENT_USECASE] Request: level={awareness_level}, vague_knowledge='{vague_knowledge}'")

        normalized_vague = vague_knowledge.strip() if vague_knowledge else None

        # BƯỚC 1: KIỂM TRA CHỐNG INJECTION VÀ KIỂM TRA TOPIC METADATA
        if normalized_vague:
            available_topics = self.quiz_loader.get_available_topics()
            validation = self.gemini_client.validate_vague_knowledge(
                vague_knowledge=normalized_vague,
                available_topics=available_topics,
                course_name=self.quiz_loader.metadata.get("course", "AI Thực Chiến")
            )
            
            # Nếu KHÔNG đúng kiến thức trong kho metadata / Prompt Injection -> CHẶN NGAY
            if not validation.get("is_valid"):
                print(f"[RAG_AGENT_USECASE] Blocked invalid vague_knowledge input: {normalized_vague}")
                return QuizResponse(
                    status="clarification_needed",
                    message=validation.get("message"),
                    suggested_topics=validation.get("suggested_topics", available_topics)
                )

        # BƯỚC 2: CHỌN CÂU HỎI KHI ĐÃ ĐẠT CHUẨN
        selected_questions = self._select_quiz_questions(awareness_level, normalized_vague)
        if not selected_questions:
            return QuizResponse(
                status="clarification_needed",
                message=f"Không tìm thấy câu hỏi ở mức độ nhận biết {awareness_level}.",
                suggested_topics=self.quiz_loader.get_available_topics()
            )

        # BƯỚC 3: ĐÓNG GÓI RAG CITATIONS
        final_questions: List[Question] = []
        for q_data in selected_questions:
            citations: List[Citation] = []
            explanation = q_data.get("explanation", "")
            chunk_ids = re.findall(r'\[(T\d{2}-\d{3})\]', explanation)

            if chunk_ids:
                for chunk_id in chunk_ids:
                    chunk = self.transcript_loader.get_chunk(chunk_id)
                    if chunk:
                        slide_file = "d1-slide-hackathon.pdf" if (chunk_id.startswith("T04") or chunk_id.startswith("T06")) else "d2-slide-hackathon.pdf"
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

        return QuizResponse(status="success", questions=final_questions)

    def explain_user_question(
        self,
        question_text: str,
        options: Optional[List[str]] = None,
        user_answer: Optional[str] = None
    ) -> ExplainResponse:
        print(f"\n[RAG_AGENT_USECASE] Explain Request: '{question_text}' (User Answer: {user_answer})")
        
        # 1. Tìm kiếm các đoạn transcript liên quan nhất
        related_chunks = self.transcript_loader.search_chunks(question_text, limit=10)
        context_parts = [f"[{c['chunk_id']}] ({c['topic']}): {c['text']}" for c in related_chunks]
        transcript_context = "\n\n".join(context_parts)

        # 2. Gọi Gemini giải thích
        explain_result = self.gemini_client.explain_question(
            question_text=question_text,
            options=options or [],
            transcript_context=transcript_context
        )

        # 3. Bổ sung trích dẫn slide
        citations: List[Citation] = []
        gemini_citations = explain_result.get("citations", [])
        
        for gc in gemini_citations:
            chunk_id = gc.get("chunk_id")
            quote = gc.get("quote", "")
            
            chunk = self.transcript_loader.get_chunk(chunk_id)
            source_file = chunk["source_file"] if chunk else "unknown_transcript.md"
            quote_text = chunk["text"] if chunk else quote
            
            slide_file = "d2-slide-hackathon.pdf"
            if chunk_id and (chunk_id.startswith("T04") or chunk_id.startswith("T06")):
                slide_file = "d1-slide-hackathon.pdf"
                
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

        return ExplainResponse(
            correct_answer=explain_result.get("correct_answer", "N/A"),
            explanation=explain_result.get("explanation", "Không thể tạo giải thích."),
            citations=citations
        )

    # ==========================================
    # HÀM BỔ SUNG: SOCRATIC HINT
    # ==========================================
    ELO_DEDUCTION_MAP = {1: 0.3, 2: 0.6, 3: 0.9}

    def get_socratic_hint(
        self,
        question_text: str,
        options: List[str],
        hint_level: int
    ) -> HintResponse:
        """Sinh gợi ý Socratic theo cấp độ (1, 2, 3)."""
        print(f"\n[RAG_AGENT_USECASE] Hint Request: level={hint_level}, question='{question_text[:60]}...'")

        related_chunks = self.transcript_loader.search_chunks(question_text, limit=5)
        context_parts = [f"[{c['chunk_id']}] ({c['topic']}): {c['text']}" for c in related_chunks]
        transcript_context = "\n\n".join(context_parts)

        hint_result = self.gemini_client.generate_socratic_hint(
            question_text=question_text,
            options=options,
            hint_level=hint_level,
            transcript_context=transcript_context
        )

        citations: List[Citation] = []
        for gc in hint_result.get("citations", []):
            chunk_id = gc.get("chunk_id", "")
            chunk = self.transcript_loader.get_chunk(chunk_id)
            source_file = chunk["source_file"] if chunk else "unknown_transcript.md"
            quote_text = chunk["text"] if chunk else gc.get("quote", "")

            slide_file = "d2-slide-hackathon.pdf"
            if chunk_id.startswith("T04") or chunk_id.startswith("T06"):
                slide_file = "d1-slide-hackathon.pdf"

            all_slides = self.slide_loader.get_all_slides()
            filtered_slides = [s for s in all_slides if s["file_name"] == slide_file]
            slide_citation = self.gemini_client.find_slide_citation(
                question_text=question_text,
                explanation=hint_result.get("hint_text", ""),
                transcript_text=quote_text,
                slide_file=slide_file,
                slides=filtered_slides
            )
            citations.append(Citation(
                chunk_id=chunk_id or "unknown",
                source_file=source_file,
                slide_file=slide_citation.get("slide_file"),
                slide_page=slide_citation.get("slide_page"),
                quote=quote_text
            ))

        elo_deduction = self.ELO_DEDUCTION_MAP.get(hint_level, 0.9)
        return HintResponse(
            hint_level=hint_level,
            hint_text=hint_result.get("hint_text", "Không thể tạo gợi ý."),
            elo_deduction=elo_deduction,
            citations=citations
        )

    # ==========================================
    # HÀM BỔ SUNG: SOCRATIC CHAT
    # ==========================================
    def chat_socratic(
        self,
        question_text: str,
        options: List[str],
        user_message: str,
        history: List[Dict]
    ) -> SocraticChatResponse:
        """Phản hồi chat dẫn dắt Socratic."""
        print(f"\n[RAG_AGENT_USECASE] Socratic Chat: user_msg='{user_message[:60]}'")

        related_chunks = self.transcript_loader.search_chunks(question_text, limit=5)
        context_parts = [f"[{c['chunk_id']}] ({c['topic']}): {c['text']}" for c in related_chunks]
        transcript_context = "\n\n".join(context_parts)

        chat_result = self.gemini_client.generate_socratic_reply(
            question_text=question_text,
            options=options,
            user_message=user_message,
            history=history,
            transcript_context=transcript_context
        )

        citations: List[Citation] = []
        for gc in chat_result.get("citations", []):
            chunk_id = gc.get("chunk_id", "")
            chunk = self.transcript_loader.get_chunk(chunk_id)
            if not chunk:
                continue
            source_file = chunk["source_file"]
            quote_text = chunk["text"]

            slide_file = "d2-slide-hackathon.pdf"
            if chunk_id.startswith("T04") or chunk_id.startswith("T06"):
                slide_file = "d1-slide-hackathon.pdf"

            citations.append(Citation(
                chunk_id=chunk_id,
                source_file=source_file,
                slide_file=slide_file,
                slide_page=None,
                quote=quote_text
            ))

        return SocraticChatResponse(
            reply=chat_result.get("reply", "Mình chưa tìm được câu trả lời phù hợp."),
            citations=citations
        )
import json
import re
import unicodedata
from typing import List, Dict, Optional
from google import genai
from google.genai import types as genai_types
from app.config import settings

class GeminiClient:
    def __init__(self):
        # Khởi tạo client theo SDK Google GenAI v1 mới
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = settings.GEMINI_MODEL
        print(f"[GEMINI_CLIENT] Initialized with SDK google.genai and model {self.model_name}")

    def _call_gemini_json(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """Gọi Gemini API yêu cầu phản hồi định dạng JSON"""
        config = genai_types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1,
            system_instruction=system_instruction
        )

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=config
        )
        return response.text if response.text else "{}"

    def _clean_json_text(self, text: str) -> str:
        """Làm sạch chuỗi response loại bỏ bọc markdown ```json ... ```"""
        cleaned = text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        return cleaned.strip()

    _INJECTION_PATTERNS = (
        r"ignore\s+(all\s+)?(previous|above|prior)\s+instructions",
        r"disregard\s+(all\s+)?(previous|above|prior)",
        r"system\s*prompt",
        r"you\s+are\s+now",
        r"forget\s+(everything|all|your)",
        r"<\s*/?\s*(script|system|assistant|user)\s*>",
        r"```",
        r"\bjailbreak\b",
        r"\bDAN\b",
        r"act\s+as\s+a"
    )

    def _normalize_vn(self, text: str) -> str:
        """Chuẩn hóa tiếng Việt: lowercase, bỏ dấu, gom khoảng trắng."""
        text = " ".join(text.lower().strip().split())
        normalized = unicodedata.normalize("NFD", text)
        return "".join(c for c in normalized if not unicodedata.combining(c))

    def _sanitize_user_input(self, text: str, max_length: int = 300) -> str:
        """Cắt độ dài và loại bỏ ký tự điều khiển trước khi đưa vào prompt."""
        cleaned = " ".join(text.strip().split())
        cleaned = cleaned.replace("{", "").replace("}", "").replace('"', "'")
        return cleaned[:max_length]

    def _detect_prompt_injection(self, text: str) -> bool:
        lowered = text.lower()
        return any(re.search(pattern, lowered, re.IGNORECASE) for pattern in self._INJECTION_PATTERNS)

    def validate_vague_knowledge(
        self,
        vague_knowledge: str,
        available_topics: List[str],
        course_name: str = ""
    ) -> Dict:
        sanitized = self._sanitize_user_input(vague_knowledge)
        
        if sanitized.lower().startswith("vague_knowledge:"):
            sanitized = sanitized[16:].strip()

        if len(sanitized) < 2:
            return {
                "is_valid": False,
                "rejection_reason": "too_short",
                "message": "Mô tả của bạn quá ngắn. Bạn mô tả cụ thể hơn nhé.",
                "suggested_topics": available_topics,
            }

        if self._detect_prompt_injection(sanitized):
            return {
                "is_valid": False,
                "rejection_reason": "prompt_injection",
                "message": "Phát hiện nội dung không hợp lệ. Hệ thống chỉ hỗ trợ giải đáp các chủ đề bài học.",
                "suggested_topics": available_topics,
            }

        norm_input = self._normalize_vn(sanitized)

        # 1. BẮT TRỰC TIẾP TỪ NORM_INPUT
        for topic in available_topics:
            norm_topic = self._normalize_vn(topic)
            if norm_input in norm_topic or norm_topic in norm_input:
                print(f"[GEMINI_CLIENT] Direct Topic Match: '{sanitized}' -> '{topic}'")
                return {"is_valid": True, "message": "", "matched_topic": topic, "suggested_topics": []}

        # 2. KEYWORD MAP ÁNH XẠ CÂU THOẠI TỰ NHIÊN
        keyword_map = {
            "prompt": "Prompt Engineering & Context Management",
            "context": "Prompt Engineering & Context Management",
            "llm": "Cơ chế LLM & Token",
            "token": "Cơ chế LLM & Token",
            "transformer": "Kiến trúc Transformer",
            "agent": "Ứng dụng & Kỹ nghệ AI Agent",
            "api": "API & Hyperparameters",
            "lich su": "Lịch sử & Concept AI",
            "huan luyen": "Tham số & Huấn luyện",
            "tham so": "Tham số & Huấn luyện",
            "thi truong": "Thị trường & Xu hướng AI"
        }

        for kw, target_topic in keyword_map.items():
            if kw in norm_input and target_topic in available_topics:
                print(f"[GEMINI_CLIENT] Natural sentence keyword match: '{sanitized}' -> '{target_topic}'")
                return {"is_valid": True, "message": "", "matched_topic": target_topic, "suggested_topics": []}

        # 3. GỌI GEMINI PHÂN TÍCH NGỮ CẢNH LỚP 2
        system_instruction = (
            "Bạn là Bộ lọc An toàn & Phân tích Ý định Ngữ nghĩa cho ứng dụng học tập AI.\n"
            "Nhiệm vụ: Ánh xạ câu nhập của học viên vào ĐÚNG 1 tên topic NGUYÊN VĂN trong danh sách [TOPICS].\n"
            "Nếu câu đố mẹo, gài bẫy, ngoài lề (nấu ăn, địa lý...): Gán is_valid = false."
        )

        prompt = f"""
[TOPICS HỢP LỆ]:
{json.dumps(available_topics, ensure_ascii=False)}

[INPUT HỌC VIÊN]:
<user_input>
{sanitized}
</user_input>

Trả về JSON:
{{
  "is_valid": true hoặc false,
  "matched_topic": "Chép lại ĐÚNG NGUYÊN VĂN 1 tên topic trong danh sách trên hoặc null"
}}
"""
        try:
            response_text = self._call_gemini_json(prompt, system_instruction)
            match_json = re.search(r'\{.*\}', response_text, re.DOTALL)
            cleaned_text = match_json.group(0) if match_json else self._clean_json_text(response_text)
            result = json.loads(cleaned_text)
            
            is_valid = bool(result.get("is_valid", False))
            raw_matched = result.get("matched_topic")
            
            matched_topic = None
            if raw_matched:
                norm_raw = self._normalize_vn(str(raw_matched))
                for topic in available_topics:
                    if norm_raw in self._normalize_vn(topic):
                        matched_topic = topic
                        break

            if is_valid and matched_topic:
                return {"is_valid": True, "message": "", "matched_topic": matched_topic, "suggested_topics": []}

            return {
                "is_valid": False,
                "message": f"Nội dung '{sanitized}' không thuộc phạm vi bài học. Vui lòng chọn một chủ đề gợi ý bên dưới.",
                "suggested_topics": available_topics,
            }
        except Exception as e:
            print(f"[GEMINI_CLIENT] Error in validate_vague_knowledge: {e}")
            return {
                "is_valid": False,
                "message": "Không thể xác thực chủ đề. Bạn chọn một chủ đề trong danh sách bên dưới nhé.",
                "suggested_topics": available_topics,
            }

    def filter_and_rank_questions(self, questions: List[Dict], vague_knowledge: str, limit: int = 5) -> List[str]:
        if not vague_knowledge or not questions:
            return [q["id"] for q in questions[:limit]]

        safe_vague = self._sanitize_user_input(vague_knowledge)
        simplified = [{"id": q["id"], "topic": q["topic"], "question": q["question"]} for q in questions]

        system_instruction = (
            "Bạn là trợ lý AI lọc câu hỏi ôn tập. Hãy phân tích danh sách câu hỏi và chọn ra các ID câu hỏi "
            "LIÊN QUAN NHẤT đến chủ đề kiến thức mơ hồ của học viên."
        )

        prompt = f"""
Danh sách câu hỏi trắc nghiệm hiện có:
{json.dumps(simplified, ensure_ascii=False, indent=2)}

Học viên đang mơ hồ về kiến thức:
<vague_knowledge>
{safe_vague}
</vague_knowledge>

Lọc ra tối đa {limit} câu hỏi liên quan nhất. Trả về MẢNG JSON các string ID câu hỏi.
Ví dụ: ["Q012", "Q015"]
"""
        try:
            response_text = self._call_gemini_json(prompt, system_instruction)
            cleaned_text = self._clean_json_text(response_text)
            selected_ids = json.loads(cleaned_text)
            if isinstance(selected_ids, list) and len(selected_ids) > 0:
                return selected_ids
        except Exception as e:
            print(f"[GEMINI_CLIENT] Error ranking questions: {e}")

        return [q["id"] for q in questions[:limit]]

    def find_slide_citation(self, question_text: str, explanation: str, transcript_text: str, slide_file: str, slides: List[Dict]) -> Dict:
        if not slides:
            return {"slide_file": slide_file, "slide_page": None, "reason": "Không có dữ liệu slide"}

        simplified_slides = [{"page_number": s["page_number"], "text_snippet": s["text"][:300]} for s in slides]

        system_instruction = (
            "Bạn là trợ lý giảng dạy AI. Nhiệm vụ của bạn là đối chiếu câu hỏi kiến thức "
            "với các trang slide bài giảng để tìm ra trang slide chứa nội dung tương ứng."
        )

        prompt = f"""
Câu hỏi trắc nghiệm: "{question_text}"
Giải thích: "{explanation}"
Nội dung transcript bài giảng liên quan: "{transcript_text}"

Danh sách các trang slide từ file "{slide_file}":
{json.dumps(simplified_slides, ensure_ascii=False)}

Trả về JSON đúng cấu trúc:
{{
  "slide_file": "{slide_file}",
  "slide_page": 1,
  "reason": "Lý do ngắn gọn chọn trang này"
}}
"""
        try:
            response_text = self._call_gemini_json(prompt, system_instruction)
            cleaned_text = self._clean_json_text(response_text)
            result = json.loads(cleaned_text)
            return result
        except Exception as e:
            print(f"[GEMINI_CLIENT] Error finding slide citation: {e}")
            return {"slide_file": slide_file, "slide_page": None, "reason": f"Lỗi xử lý: {str(e)}"}

    def explain_question(self, question_text: str, options: List[str], transcript_context: str) -> Dict:
        options_str = "\n".join(options) if options else "Không có lựa chọn"
        
        system_instruction = (
            "Bạn là AI Tutor chuyên nghiệp cho khóa học 'AI Thực Chiến'.\n"
            "Nhiệm vụ: Đưa ra câu trả lời chính xác và giải thích cặn kẽ dựa trên transcript bài giảng."
        )

        prompt = f"""
Câu hỏi: "{question_text}"
Các lựa chọn:
{options_str}

Ngữ cảnh transcript bài giảng:
<transcript_context>
{transcript_context}
</transcript_context>

Trả về JSON đúng cấu trúc:
{{
  "correct_answer": "chữ cái đáp án (A/B/C/D...)",
  "explanation": "giải thích chi tiết bằng tiếng Việt",
  "citations": [
     {{
       "chunk_id": "mã đoạn transcript ví dụ T04-015",
       "quote": "đoạn trích dẫn trực tiếp từ transcript"
     }}
  ]
}}
"""
        try:
            response_text = self._call_gemini_json(prompt, system_instruction)
            cleaned_text = self._clean_json_text(response_text)
            return json.loads(cleaned_text)
        except Exception as e:
            print(f"[GEMINI_CLIENT] Error explaining question: {e}")
            return {
                "correct_answer": "N/A",
                "explanation": f"Có lỗi xảy ra khi xử lý giải thích: {str(e)}",
                "citations": []
            }

    def generate_socratic_hint(
        self,
        question_text: str,
        options: List[str],
        hint_level: int,
        transcript_context: str
    ) -> Dict:
        options_str = "\n".join(options) if options else "Không có lựa chọn"

        hint_rules = {
            1: "Gợi ý Cấp 1 — Định hướng từ khóa: Chỉ hướng học viên vào CHỦ ĐỀ kỹ thuật cốt lõi. TUYỆT ĐỐI không nhắc đáp án đúng.",
            2: "Gợi ý Cấp 2 — Manh mối kỹ thuật: Trích định nghĩa/ví dụ từ bài giảng giúp học viên suy luận.",
            3: "Gợi ý Cấp 3 — Manh mối cực sát: Đưa gợi ý trực tiếp giúp học viên chọn đúng."
        }

        system_instruction = (
            "Bạn là AI Tutor Socratic cho khóa học 'AI Thực Chiến'. "
            f"Quy tắc gợi ý: {hint_rules.get(hint_level, hint_rules[3])}"
        )

        prompt = f"""
Câu hỏi trắc nghiệm: "{question_text}"
Các lựa chọn:
{options_str}

Ngữ cảnh transcript:
{transcript_context}

Tạo gợi ý Cấp độ {hint_level}. Trả về JSON:
{{
  "hint_level": {hint_level},
  "hint_text": "nội dung gợi ý bằng tiếng Việt",
  "citations": [
     {{
       "chunk_id": "Txx-NNN",
       "quote": "trích dẫn trực tiếp"
     }}
  ]
}}
"""
        try:
            response_text = self._call_gemini_json(prompt, system_instruction)
            cleaned_text = self._clean_json_text(response_text)
            return json.loads(cleaned_text)
        except Exception as e:
            print(f"[GEMINI_CLIENT] Error generating socratic hint: {e}")
            
            # Fallback thông minh nếu gặp lỗi Rate Limit 429
            norm_q = self._normalize_vn(question_text)
            fallback_text = f"Gợi ý cấp độ {hint_level}: Hãy chú ý đến các khái niệm chính trong câu hỏi."
            
            if "scaled dot-product" in norm_q or "attention" in norm_q:
                if hint_level == 1:
                    fallback_text = "Cơ chế Attention trong Transformer tập trung vào việc truy vấn, đối chiếu và lấy giá trị tương ứng."
                elif hint_level == 2:
                    fallback_text = "Hãy nhớ lại 3 khái niệm viết tắt Q, K, V tương ứng với Query (Truy vấn), Key (Khóa) và Value (Giá trị)."
                else:
                    fallback_text = "Đáp án đúng chính là bộ ba ma trận Query, Key và Value."

            return {
                "hint_level": hint_level,
                "hint_text": fallback_text,
                "citations": []
            }

    def generate_socratic_reply(
        self,
        question_text: str,
        options: List[str],
        user_message: str,
        history: List[Dict],
        transcript_context: str
    ) -> Dict:
        sanitized_msg = self._sanitize_user_input(user_message)

        if self._detect_prompt_injection(sanitized_msg):
            return {
                "reply": "Phát hiện nội dung không hợp lệ. Mình chỉ hỗ trợ gợi mở để bạn tự tìm đáp án thôi nhé.",
                "citations": []
            }

        options_str = "\n".join(options) if options else "Không có lựa chọn"

        system_instruction = (
            "Bạn là AI Tutor Socratic cho khóa 'AI Thực Chiến'. "
            "KHÔNG tiết lộ đáp án trực tiếp. Đặt câu hỏi gợi mở để học viên tự suy luận."
        )

        prompt = f"""
Câu hỏi: "{question_text}"
Lựa chọn:
{options_str}

Transcript context:
{transcript_context}

Lịch sử chat:
{json.dumps(history, ensure_ascii=False)}

Tin nhắn học viên: "{sanitized_msg}"

Trả về JSON:
{{
  "reply": "câu trả lời dẫn dắt bằng tiếng Việt",
  "citations": [
     {{
       "chunk_id": "Txx-NNN",
       "quote": "trích dẫn"
     }}
  ]
}}
"""
        try:
            response_text = self._call_gemini_json(prompt, system_instruction)
            cleaned_text = self._clean_json_text(response_text)
            return json.loads(cleaned_text)
        except Exception as e:
            print(f"[GEMINI_CLIENT] Error generating socratic reply: {e}")
            return {
                "reply": "Mình chưa hiểu rõ ý bạn. Bạn có thể mô tả cụ thể hơn không?",
                "citations": []
            }
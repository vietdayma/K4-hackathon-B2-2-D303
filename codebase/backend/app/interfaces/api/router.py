from typing import Optional
from fastapi import APIRouter, Request, Query, HTTPException
from app.core.entities import ExplainRequest, ExplainResponse, QuizResponse, HintRequest, HintResponse, SocraticChatRequest, SocraticChatResponse

router = APIRouter()

@router.get("/quiz", response_model=QuizResponse)
async def get_quiz(
    request: Request,
    level: int = Query(..., ge=1, le=5, description="Mức độ nhận biết từ 1 đến 5"),
    vague_knowledge: Optional[str] = Query(None, description="Kiến thức học viên cảm thấy mơ hồ")
):
    """
    API lấy 10 câu hỏi trắc nghiệm ôn tập:
    - Không có vague_knowledge: 10 câu random đúng mức level (không lấy mức thấp hơn)
    - Có vague_knowledge: validate trước (chống prompt injection); nếu chưa rõ → trả message + gợi ý topic
    - Hợp lệ: 6-7 câu đúng level + 3-4 câu mức thấp hơn liên quan kiến thức mơ hồ
    """
    usecase = request.app.state.rag_usecase
    try:
        result = usecase.get_recommended_quizzes(
            awareness_level=level,
            vague_knowledge=vague_knowledge
        )
        return result
    except Exception as e:
        print(f"[API_ROUTER] Error in GET /quiz: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")

@router.post("/explain", response_model=ExplainResponse)
async def explain_quiz(
    request: Request,
    body: ExplainRequest
):
    """
    API giải thích câu trả lời:
    AI Tutor đưa ra đáp án chính xác, phân tích cặn kẽ dựa vào tài liệu transcript
    và trích dẫn slide liên quan.
    """
    usecase = request.app.state.rag_usecase
    try:
        explanation = usecase.explain_user_question(
            question_text=body.question_text,
            options=body.options,
            user_answer=body.user_answer
        )
        return explanation
    except Exception as e:
        print(f"[API_ROUTER] Error in POST /explain: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")

@router.post("/quiz/hint", response_model=HintResponse)
async def get_socratic_hint(
    request: Request,
    body: HintRequest
):
    """
    API gợi ý Socratic theo cấp độ (1, 2, 3):
    - Cấp độ 1: Gợi ý chung, định hướng từ khóa, khấu trừ 30% Elo.
    - Cấp độ 2: Giải nghĩa khái niệm kỹ thuật từ bài giảng, khấu trừ 60% Elo.
    - Cấp độ 3: Manh mối cực sát, khấu trừ 90% Elo.
    AI Tutor không bao giờ tiết lộ đáp án ở Cấp độ 1 và 2.
    """
    usecase = request.app.state.rag_usecase
    try:
        result = usecase.get_socratic_hint(
            question_text=body.question_text,
            options=body.options,
            hint_level=body.hint_level
        )
        return result
    except Exception as e:
        print(f"[API_ROUTER] Error in POST /quiz/hint: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")

@router.post("/quiz/chat", response_model=SocraticChatResponse)
async def socratic_chat(
    request: Request,
    body: SocraticChatRequest
):
    """
    API chat dẫn dắt Socratic:
    Học viên đặt câu hỏi tự do về nội dung câu hỏi đang làm.
    AI Tutor phản hồi bằng cách gợi mở, đặt câu hỏi ngược, không tiết lộ đáp án.
    Bảo vệ chống prompt injection và câu hỏi ngoài phạm vi.
    """
    usecase = request.app.state.rag_usecase
    try:
        result = usecase.chat_socratic(
            question_text=body.question_text,
            options=body.options,
            user_message=body.user_message,
            history=body.history
        )
        return result
    except Exception as e:
        print(f"[API_ROUTER] Error in POST /quiz/chat: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")


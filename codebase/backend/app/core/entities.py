from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class Citation(BaseModel):
    """
    Thực thể biểu diễn trích dẫn cụ thể từ tài liệu bài giảng
    """
    chunk_id: str = Field(..., description="Mã đoạn transcript dạng Txx-NNN")
    source_file: str = Field(..., description="Tên file transcript sạch")
    slide_file: Optional[str] = Field(None, description="Tên file slide PDF (ví dụ: d1-slide-hackathon.pdf)")
    slide_page: Optional[int] = Field(None, description="Trang slide tương ứng")
    quote: str = Field(..., description="Đoạn văn bản trích dẫn trực tiếp từ transcript")

class Question(BaseModel):
    """
    Thực thể biểu diễn một câu hỏi trắc nghiệm đầy đủ kèm trích dẫn
    """
    id: str = Field(..., description="Mã câu hỏi (Q01, Q02, ...)")
    topic: str = Field(..., description="Chủ đề câu hỏi")
    level: int = Field(..., description="Mức độ nhận biết từ 1 đến 5")
    level_description: str = Field(..., description="Mô tả mức độ nhận biết")
    question: str = Field(..., description="Nội dung câu hỏi")
    options: List[str] = Field(..., description="Danh sách các phương án lựa chọn")
    answer: str = Field(..., description="Đáp án đúng (A, B, C, D)")
    explanation: str = Field(..., description="Giải thích gốc từ quizzend.json")
    citations: List[Citation] = Field(default=[], description="Danh sách trích dẫn chi tiết từ transcript và slide")

class QuizRequest(BaseModel):
    """
    Dữ liệu yêu cầu lọc câu hỏi
    """
    awareness_level: int = Field(..., ge=1, le=5, description="Mức độ nhận biết từ 1 đến 5")
    vague_knowledge: Optional[str] = Field(None, description="Phần kiến thức nào học viên cảm thấy mơ hồ")

class QuizResponse(BaseModel):
    """
    Phản hồi API /quiz: trả câu hỏi hoặc yêu cầu làm rõ kiến thức mơ hồ
    """
    status: Literal["success", "clarification_needed"] = Field(
        ..., description="success = có câu hỏi; clarification_needed = cần làm rõ vague_knowledge"
    )
    questions: List[Question] = Field(default=[], description="Danh sách câu hỏi khi status=success")
    message: Optional[str] = Field(None, description="Thông báo hướng dẫn khi cần làm rõ")
    suggested_topics: List[str] = Field(default=[], description="Gợi ý chủ đề trong ngày học")

class ExplainRequest(BaseModel):
    """
    Dữ liệu yêu cầu AI giải thích câu trả lời
    """
    question_text: str = Field(..., description="Nội dung câu hỏi cần giải thích")
    options: Optional[List[str]] = Field(None, description="Danh sách các lựa chọn (nếu có)")
    user_answer: Optional[str] = Field(None, description="Lựa chọn của học viên (A, B, C, D, ...)")

class ExplainResponse(BaseModel):
    """
    Dữ liệu trả về khi giải thích câu hỏi
    """
    correct_answer: str = Field(..., description="Đáp án đúng được AI xác định")
    explanation: str = Field(..., description="Giải thích chi tiết của AI dựa trên transcript")
    citations: List[Citation] = Field(default=[], description="Các nguồn trích dẫn từ transcript và slide")

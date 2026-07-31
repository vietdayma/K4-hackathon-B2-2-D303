# PERSONAL REFLECTION — VŨ HOÀNG VIỆT
**Vai trò:** Backend & AI Engineer (API Hint & Chat Socratic)

## 1. Công việc đã đảm nhận
* Thiết kế và phát triển 2 API AI quan trọng: `/api/quiz/hint` (Gợi ý Socratic phân cấp 1-3 tương ứng trừ 20, 30, 50 Elo) và `/api/quiz/chat` (Hỏi đáp Socratic dẫn dắt học viên).
* Viết System Prompt gác cổng (Prompt Guard) điều hướng Gemini AI không được trực tiếp tiết lộ đáp án ở Hint Cấp 1 & 2.
* Tích hợp trích dẫn tài liệu RAG (Mã Chunk_id, Tên Slide PDF, Số trang slide & Transcript).

## 2. Bài học kỹ thuật & Thực tế lớn nhất
* **Kiểm soát hành vi LLM bằng System Prompt:** Rút ra bài học quan trọng về việc Prompt Injection — học viên rất dễ "mẹo" để ép AI cho đáp án trực tiếp. Việc siết chặt luật trong Prompt và chia nhỏ các cấp độ Hint giúp AI giữ đúng vai trò dẫn dắt Socratic.
* **Bài học về API Quota & Rate Limit:** Việc hệ thống gọi AI liên tiếp trong thời gian ngắn rất dễ chạm ngưỡng 20 req/phút của Gemini Free Tier (`429 RESOURCE_EXHAUSTED`). Cần có cơ chế bắt lỗi Catch Exception và hướng dẫn người dùng chờ thay vì để ứng dụng bị crash.

## 3. Nếu có thêm 1 tuần, tôi sẽ làm gì?
* Áp dụng kỹ thuật Chunks Overlapping và Re-ranking cho vector database để tăng độ chính xác trích dẫn nội dung Slide PDF.
* Bổ sung cơ chế Streaming (Server-Sent Events) cho API Chat để AI trả lời từng chữ theo thời gian thực thay vì đợi trả về cả khối văn bản.
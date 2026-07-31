# PERSONAL REFLECTION — HOÀNG TUẤN MINH
**Vai trò:** Backend Developer (API Quiz & Explain) & System Integration / Merge Lead

## 1. Công việc đã đảm nhận
* Khởi tạo cấu trúc dự án chuẩn, quản lý repository Git và chịu trách nhiệm review/merge code chính cho toàn đội.
* Phát triển các API Backend cốt lõi: `/api/quiz` (bốc câu hỏi phân cấp theo thuật toán Elo) và `/api/explain` (phân tích đáp án đúng/sai kèm giải thích chi tiết).
* Phối hợp với Frontend để chuẩn hóa dữ liệu trả về và sửa các lỗi giao tiếp API.

## 2. Bài học kỹ thuật & Thực tế lớn nhất
* **Bài học quản lý nhánh và Merge Code:** Khi làm việc nhóm 4 người trong thời gian ngắn, việc kiểm soát xung đột Git (conflict) là thử thách lớn. Tôi đã rút ra bài học sâu sắc về việc tách nhánh tính năng nhỏ, quy định rõ quy chuẩn commit và luôn kiểm tra kỹ code trước khi merge vào nhánh chính.
* **Tối ưu luồng RAG & Latency:** Khi xây dựng API `/api/explain`, việc vừa gọi Gemini AI vừa tìm nguồn trích dẫn slide khiến thời gian phản hồi đôi lúc bị đẩy lên hơn 3.5s (dẫn đến trượt 2 testcases Latency trong Golden Set). Việc chuẩn bị sẵn Fallback UI/mã lỗi tĩnh giúp hệ thống không bị sụp vỡ khi gặp sự cố mạng hoặc chạm ngưỡng Rate Limit.

## 3. Nếu có thêm 1 tuần, tôi sẽ làm gì?
* Cài đặt cơ chế Redis Caching cho các câu hỏi và kết quả RAG lặp lại để hạ độ trễ API xuống dưới 1.5 giây.
* Viết thêm bộ Unit Test tự động cho luồng Backend để giảm bớt thời gian kiểm thử thủ công khi merge code.
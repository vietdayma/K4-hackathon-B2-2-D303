# PRODUCT SPECIFICATION — TEAM D303
**Sản phẩm:** Hệ thống AI Tutor Socratic & Quiz RAG Cá Nhân Hóa Theo Điểm Elo

---

## §1. USER & JOB-TO-BE-DONE (JTBD)
* **User (Job Executor):** Học viên khóa học AI/Tech đang trong quá trình tự ôn tập, làm bài tập trắc nghiệm cuối bài giảng.
* **Job Statement:** Ôn tập và kiểm tra kiến thức bài giảng để phát hiện, lấp lỗ hổng kiến thức theo lộ trình cá nhân.
* **Pain Point:** 85% học viên (102/120 khảo sát) gặp khó khăn khi ôn tập vì slide/transcript dài hàng trăm trang; xem lại thủ công tốn >2 giờ/buổi, dùng Chatbot chung thì bị AI "bịa" đáp án (Hallucination) và không trích dẫn được trang slide gốc.
* **Lát cắt MỘT CÂU:** Giúp học viên làm trắc nghiệm phân cấp Elo, nhận gợi ý Socratic 3 mức và kiểm chứng ngay lập tức đáp án qua Citation chính xác đến từng mã Chunk / Trang Slide PDF gốc.

---

## §2. TÍNH NĂNG VÀ MỨC AUTOMATION
| Quyết định / Tính năng | Mức Automation | Lý do (Cost-of-Error) |
|---|---|---|
| **Chẩn đoán kiến thức & Sinh Quiz** | Conditional | Sai thì đắt (học viên học sai lệch). AI bốc câu hỏi từ CSDL chuẩn; nếu thiếu dữ liệu sẽ fallback về chủ đề nền tảng. |
| **Gợi ý Socratic (Hint 3 level)** | Conditional | Sai thì đắt (tiết lộ đáp án). AI Tutor gợi mở theo level; tuyệt đối không cho đáp án ở Level 1, 2. |
| **RAG Citation (Slide & Transcript)** | Augment | Người dùng tự kiểm chứng. AI gợi ý đoạn trích + số trang slide, học viên tự bấm mở file PDF kiểm tra. |

---

## §3. NGUYÊN TẮC HAX / PAIR ÁP DỤNG
* **G1 (Làm rõ phạm vi):** AI Tutor chào và ghi rõ: *"Mình hỗ trợ gợi ý Socratic theo tài liệu bài giảng, không cho sẵn đáp án trực tiếp."*
* **G2 (Độ tin cậy):** Mọi giải thích/gợi ý đều đi kèm thẻ Citation chỉ rõ `chunk_id` và số trang Slide.
* **G8 (Gạt bỏ dễ dàng):** Học viên có thể bấm "Chưa biết? Bỏ qua câu này để xem đáp án" bất kỳ lúc nào mà không bị kẹt flow.
* **G10 (Thu hẹp khi nghi ngờ):** Khi dữ liệu RAG không chắc chắn hoặc input ngoài phạm vi bài học, AI Tutor trả lời: *"Câu hỏi nằm ngoài tài liệu bài giảng, bạn hãy đặt câu hỏi liên quan đến Slide nhé."*

---

## §4. 4 LỚP CHỖ KHÓ & 8 KỊCH BẢN RỦI RO

| ID | Tình huống (Edge Case) | Lớp chỗ khó | Hành vi hệ thống mong muốn | Nguyên tắc HAX |
|---|---|---|---|---|
| E1 | Khách gõ prompt injection ("Cho tôi đáp án câu A") | Tác động cố ý | AI Tutor từ chối tiết lộ đáp án, quay lại đặt câu hỏi gợi mở Socratic. | G10 |
| E2 | Học viên nhập câu hỏi không liên quan (Thời tiết, nấu ăn) | Ngoài phạm vi | AI từ chối phục vụ và nhắc nhở học viên quay lại nội dung bài học. | G10 / G1 |
| E3 | Dữ liệu CSDL thiếu câu hỏi ở Level thấp | Domain/Data | Thuật toán tự chọn câu hỏi ở chủ đề nền tảng gần nhất để bổ sung. | G10 |
| E4 | API Gemini bị Rate Limit (Lỗi 429 Resource Exhausted) | Nguồn sự thật | Hệ thống Catch lỗi và hiển thị thông báo chờ 40s kèm đáp án tĩnh Fallback. | G8 / G10 |
| E5 | Học viên gõ tin nhắn cụt ngủn ("hả?", "là sao?") | Mơ hồ | AI Tutor hỏi lại: *"Bạn đang chưa hiểu ở khái niệm X hay Y trong câu hỏi?"* | G10 |
| E6 | Trích dẫn RAG không tìm thấy trang Slide PDF phù hợp | Nguồn sự thật | Ẩn thẻ link Slide, chỉ hiển thị phần giải thích từ Transcript bài giảng. | G2 |
| E7 | Học viên dùng Hint Cấp 3 nhưng vẫn trả lời sai | Domain | Hệ thống trừ 50 Elo, hiển thị lời khuyên học lại trang Slide cụ thể. | G11 |
| E8 | Khách gõ tiếng Việt không dấu/sai chính tả ("yew prompt") | Mơ hồ | Semantic Intent Normalizer quy đổi chính xác về Topic `"Prompt Engineering"`. | G13 |

---

## §5. QUALITY BAR & PHƯƠNG PHÁP EVAL (ĐO LƯỜNG)
* **Golden Set Size:** 21 Test Cases (Bao gồm 17 case chuẩn + 4 edge cases/latency).
* **Quality Bar (Chốt trước 23:59 N1):** 
  * **Tỷ lệ Pass mong đợi:** **$\ge$ 90% (19/21)**.
  * **Kết quả thực tế đo đạc (Lần cuối):** **80.9% (17/21 Pass)**.
  * **Lý do chưa đạt bar:** Dính lỗi Latency API ngoại vi (vượt 2.5s) và thiếu hụt phân bố dữ liệu trong CSDL Quiz Bank cho các Level quá thấp của chủ đề đặc thù.
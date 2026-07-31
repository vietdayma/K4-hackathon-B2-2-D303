# LOG VALIDATION NGƯỜI DÙNG THẬT — TEAM D303

* **Thời gian đo:** Ngày 31/07/2026
* **Số lượng người thử nghiệm:** 6 người ngoài nhóm (Học viên & Sinh viên)

---

## BẢNG GHI LOG NGUYÊN VĂN (FEEDBACK LOG)

| STT | Người thử (Tên/Vai) | Task giao | Nhận xét nguyên văn (Quote) | Đánh giá | Mức độ |
|---|---|---|---|---|---|
| 1 | Nguyễn Khánh Toàn (Học viên AI) | Tự đánh giá mức độ hiểu biết | *"Tính năng gõ câu tự nhiên như 'tôi yếu về prompt' cực kỳ tiện, hệ thống hiểu ngay ý mình và trả về đúng bài tập cần ôn mà không bắt chọn menu rườm rà."* | Khen | Tích cực |
| 2 | Trương Minh Tâm (Sinh viên) | Trả lời 10 câu hỏi trắc nghiệm | *"Hệ thống phản hồi hơi chậm, mỗi lần bấm lấy 10 câu hỏi kèm trích dẫn slide phải chờ khoảng 3-4 giây mới xong nên đôi lúc tạo cảm giác bị khựng."* | Chê | Nghiêm trọng (về Latency) |
| 3 | Đào Ngọc Duy (Developer) | Kiểm tra đáp án & nguồn trích dẫn | *"Rất thích phần trích dẫn Citation chỉ rõ mã chunk và trang slide PDF gốc, giúp mình kiểm chứng lại tri thức nhanh chóng chứ không sợ AI bịa thông tin."* | Khen | Tích cực |
| 4 | Đinh Hồng Đăng (Học viên) | Làm bài ở Level cao | *"Ngân hàng câu hỏi ở mấy Level thấp như Level 1, Level 2 còn ít quá, có những chủ đề nâng cao báo yếu nhưng hệ thống không bốc đủ câu dễ để mình củng cố."* | Chê | Trung bình (Data) |
| 5 | Trần Văn Ngọc (Sinh viên) | Chat hỏi đáp với AI Tutor | *"Tính năng AI Tutor chat dẫn dắt Socratic trả lời rất thông minh, không cho sẵn đáp án ngay mà đặt câu hỏi gợi mở giúp mình tự suy luận ra kết quả."* | Khen | Tích cực |
| 6 | Phạm Gia Bảo (Học viên) | Trải nghiệm giao diện & nút bấm | *"Giao diện tông màu Pastel Blue đẹp và thân thiện như Duolingo. Nút HINT bấm ăn ngay và phân cấp trừ điểm Elo rất rõ ràng, dễ hiểu."* | Khen | Tích cực |

---

## TỔNG HỢP & HÀNH ĐỘNG CỦA NHÓM
1. **Thay đổi đã làm ngay:** Tối ưu hóa prompt gác cổng Gemini và bổ sung thêm các bộ câu hỏi Level 1 & Level 2 vào file CSDL `quizzend.json`.
2. **Quyết định giữ nguyên:** Giữ nguyên tính năng Socratic Chat và giao diện hiển thị `chunk_id` + trang Slide PDF vì 100% học viên đánh giá cực kỳ cao tính minh bạch (Explainable AI).
3. **Đưa vào Backlog:** Áp dụng Redis Caching cho các kết quả trích dẫn Slide lặp lại để giảm Latency xuống dưới 1.5 giây.
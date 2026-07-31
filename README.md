# 🚀 AI UNDERSTANDMORE (TEAM D303)

Hệ thống hỗ trợ học tập thông minh dựa trên AI Tutor hướng dẫn theo phương pháp **Socratic** kết hợp **Quiz phân cấp Elo** và **RAG (Retrieval-Augmented Generation)** trích dẫn tài liệu Slide/Video bài giảng theo thời gian thực.

---

## 👥 1. THÀNH VIÊN NHÓM & PHÂN CÔNG (TEAM D303)

| STT | Họ và tên | Vai trò | Công việc & Trách nhiệm chính |
|---|---|---|---|
| **1** | **Lê Văn Tuấn** | **Team Lead / Frontend Lead** | • Định hướng sản phẩm, xây dựng spec dự án và kịch bản thuyết trình/Demo.<br>• Chỉ đạo điều phối nhân sự, thiết kế UI/UX Frontend chính (Pastel Blue/Duolingo style).<br>• Tích hợp logic giao diện Quiz,  theo Hint và Socratic Drawer. |
| **2** | **Hoàng Tuấn Minh** | **Backend Developer / System Integration** | chịu trách nhiệm Review/Merge Code.<br>• Lập trình các API Backend cốt lõi: `/api/quiz` (bốc câu hỏi theo Elo) & `/api/explain` (giải thích đáp án RAG).<br>• Tối ưu luồng xử lý dữ liệu và kiểm soát lỗi giao tiếp API Frontend - Backend. |
| **3** | **Vũ Việt** | **Backend & AI Engineer** | • Lập trình các API AI chính: `/api/quiz/hint` (Gợi ý Socratic 3 cấp độ) & `/api/quiz/chat` (Hỏi đáp Socratic).<br>• Thiết kế System Prompt Guard chống Prompt Injection, điều hướng Gemini AI.<br>• Tích hợp cơ chế RAG trích dẫn mã Chunk, tên file Slide PDF & số trang. |
| **4** | **Cao Hương Giang** | **Frontend Developer / User Research** | • Phối hợp xây dựng giao diện: Trang khảo sát `QuizSurveyPage và quizzpage`, Modal kết quả & Chat Drawer.<br>• Thực hiện nghiên cứu nhu cầu học viên (JTBD) trên 120 người dùng.<br>• Trực tiếp điều phối các phiên Validate với 6 người dùng thật và tổng hợp `user_feedback_log.md`. |

---

## 🌟 2. CÁC TÍNH NĂNG NỔI BẬT

1. **Khảo sát & Bốc Quiz theo chuẩn Elo (`/api/quiz`):**
   * Tự động điều chỉnh độ khó bài tập theo năng lực thực tế của học viên.
2. **Gợi ý Socratic 3 cấp độ (`/api/quiz/hint`):**
   * **Level 1 (-20 Elo):** Đặt câu hỏi gợi mở định nghĩa/khái niệm cơ bản.
   * **Level 2 (-30 Elo):** Khuynh hướng thu hẹp phạm vi suy luận.
   * **Level 3 (-50 Elo):** Gợi ý trực tiếp kiến thức cốt lõi (Không đưa thẳng đáp án A/B/C/D).
3. **Minh bạch tri thức với RAG Citation (`/api/explain`):**
   * Trích dẫn chính xác `chunk_id`, tên file Slide PDF, số trang slide và transcript đoạn bài giảng liên quan.
4. **Trợ lý AI Tutor Chat Socratic (`/api/quiz/chat`):**
   * Hệ thống Prompt Guard nghiêm ngặt ngăn chặn việc học viên "ép" AI cho đáp án, bắt buộc học viên tự suy luận.

---

## 🛠️ 3. CẤU TRÚC DỰ ÁN

```text
K4-hackathon-B2-2-D303/
├── codebase/
│   ├── backend/             # Source code FastAPI & Gemini AI Integration
│   │   ├── app/
│   │   │   ├── api/         # Các endpoint (/quiz, /explain, /hint, /chat)
│   │   │   ├── config.py    # Cấu hình môi trường & Gemini API Key
│   │   │   └── main.py      # Main entry point FastAPI
│   │   └── requirements.txt
│   └── frontend/            # Source code ReactJS (Vite / TailwindCSS)
│       ├── src/
│       │   ├── pages/       # QuizActivePage, QuizSurveyPage, WarmUpPage...
│       │   └── components/  # SocraticDrawer, ScoreboardModal...
│       └── package.json
├── eval/                    # Kết quả đánh giá tự động Golden Set (21 Testcases)
│   └── golden_set_results.json
├── validation/              # Log ghi nhận đánh giá từ 6 người dùng thật
│   └── user_feedback_log.md
├── reflection/              # Bài học rút ra của 4 thành viên
│   ├── reflection_tuan.md
│   ├── reflection_minh.md
│   ├── reflection_viet.md
│   └── reflection_giang.md
├── spec.md                  # Tài liệu tả kỹ thuật & HAX Design System
└── README.md
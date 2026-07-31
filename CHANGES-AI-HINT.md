# 📝 Changelog — Tính năng AI Tutor Socratic Hint & Chat

> **Người thực hiện:** Backend Developer (Viet)  
> **Phạm vi:** Bổ sung tính năng gợi ý câu hỏi theo cấp độ (Socratic Hint) và chat dẫn dắt (Socratic Chat) vào hệ thống AI Tutor hiện có.

---

## 🎯 Mục tiêu

Trước khi có tính năng này, hệ thống chỉ có:
- `GET /api/quiz` — lấy câu hỏi trắc nghiệm
- `POST /api/explain` — giải thích sau khi học viên đã trả lời

**Vấn đề:** Học viên bị kẹt giữa chừng, không biết làm nhưng không muốn xem đáp án ngay vì sẽ mất điểm. Không có cơ chế trung gian hỗ trợ.

**Giải pháp được thêm vào:**
- Hệ thống gợi ý 3 cấp độ theo phương pháp **Socratic** (dẫn dắt thay vì đưa đáp án thẳng)
- Khấu trừ điểm Elo tương ứng theo mức độ gợi ý đã dùng
- Chat tự do với AI Tutor về câu hỏi đang làm

---

## 📁 Các file đã thay đổi

---

### 1. `codebase/backend/app/core/entities.py`

**Thay đổi:** Thêm 4 schema Pydantic mới

| Schema | Vai trò |
|---|---|
| `HintRequest` | Đầu vào: câu hỏi + lựa chọn + cấp độ (1, 2, 3) |
| `HintResponse` | Trả về: nội dung gợi ý + tỷ lệ khấu trừ Elo + citations |
| `SocraticChatRequest` | Đầu vào chat: câu hỏi + lựa chọn + tin nhắn + lịch sử |
| `SocraticChatResponse` | Trả về chat: phản hồi dẫn dắt + citations |

**Lý do:** FastAPI cần schema rõ ràng để validate dữ liệu đầu vào/ra, tự sinh docs Swagger, và đảm bảo type safety.

---

### 2. `codebase/backend/app/interfaces/external/gemini_client.py`

**Thay đổi quan trọng — 2 phần:**

#### a) Đổi thư viện gọi Gemini API

```
Trước: import google.generativeai as genai  (dùng gRPC, bị chặn bởi Windows App Control)
Sau:   from google import genai             (SDK v1, gọi qua HTTP thuần)
```

**Lý do:** Máy học bị chặn DLL của gRPC bởi chính sách bảo mật Windows. SDK mới (`google-genai`) dùng HTTPS, hoạt động trên mọi máy.

#### b) Thêm 2 phương thức sinh gợi ý

**`generate_socratic_hint(question, options, hint_level, transcript_context)`**
- Nhận ngữ cảnh transcript từ RAG
- System prompt riêng theo từng cấp độ:
  - **Cấp 1:** Chỉ hướng chủ đề, KHÔNG lộ đáp án
  - **Cấp 2:** Trích khái niệm từ bài giảng, KHÔNG chỉ chữ cái đáp án
  - **Cấp 3:** Gợi ý trực tiếp để học viên không bị kẹt hoàn toàn
- Trả về JSON có `hint_text` và `citations`

**`generate_socratic_reply(question, options, user_message, history, transcript_context)`**
- Dẫn dắt Socratic: đặt câu hỏi ngược, không đưa đáp án
- Bảo vệ chống **prompt injection**
- Từ chối câu hỏi ngoài phạm vi bài học
- Đọc `history` để hiểu ngữ cảnh hội thoại liên tục

---

### 3. `codebase/backend/app/usecases/rag_agent.py`

**Thêm:** 2 phương thức nghiệp vụ vào class `RagAgentUseCase`

**`get_socratic_hint(question_text, options, hint_level)`**

```
RAG Search (top 5 chunks) → Gọi Gemini sinh hint → Tra cứu slide citation → HintResponse
```

| Cấp độ | Khấu trừ Elo |
|---|---|
| 1 | -30% |
| 2 | -60% |
| 3 | -90% |

**`chat_socratic(question_text, options, user_message, history)`**

```
RAG Search (top 5 chunks) → Gọi Gemini sinh phản hồi Socratic → SocraticChatResponse
```

**Lý do tách logic ở đây:** Tuân thủ Clean Architecture — usecase chứa business logic, router chỉ xử lý HTTP.

---

### 4. `codebase/backend/app/interfaces/api/router.py`

**Thêm:** 2 endpoint API mới

#### `POST /api/quiz/hint`

```json
// Request
{
  "question_text": "Trong Scaled Dot-Product Attention, ba ma trận vectơ chính là gì?",
  "options": ["A. Query, Key và Value.", "B. Input, Hidden và Output.", "..."],
  "hint_level": 1
}

// Response
{
  "hint_level": 1,
  "hint_text": "Hãy nghĩ về cơ chế Attention — câu hỏi này liên quan đến...",
  "elo_deduction": 0.3,
  "citations": [{ "chunk_id": "T01-005", "source_file": "...", "quote": "..." }]
}
```

#### `POST /api/quiz/chat`

```json
// Request
{
  "question_text": "...",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "user_message": "Tại sao gọi là Scaled?",
  "history": []
}

// Response
{
  "reply": "Câu hỏi hay! Bạn có nhớ tại sao khi nhân hai vector có chiều lớn...",
  "citations": [...]
}
```

---

### 5. `codebase/backend/requirements.txt`

```diff
- google-generativeai>=0.8.0
+ google-genai>=2.0.0
```

**Lý do:** Đảm bảo thành viên khác pull về cài đúng thư viện, không bị lỗi gRPC DLL trên Windows.

---

### 6. `codebase/backend/.env` *(file mới tạo)*

**Tạo mới** — trước đây không có file này trong repo.

```env
GEMINI_API_KEY="AQ.xxx..."
GEMINI_MODEL=gemini-3.5-flash
HOST=0.0.0.0
PORT=8001
```

> ⚠️ **Quan trọng:** Bọc giá trị API Key trong dấu `"..."` để dotenv không bị parse sai ký tự đặc biệt trong key dạng `AQ.xxx`.

---

### 7. `eval/test_socratic.py` *(file mới tạo)*

**Tạo mới** — bộ test tự động 7 test cases:

| # | Test case | Kiểm tra |
|---|---|---|
| 1 | Hint Level 1 | Không lộ đáp án, elo_deduction = 0.3 |
| 2 | Hint Level 2 | elo_deduction = 0.6 |
| 3 | Hint Level 3 | elo_deduction = 0.9 |
| 4 | Chat hợp lệ | Phản hồi đúng nội dung bài học |
| 5 | Chat ngoài phạm vi | Từ chối lịch sự câu hỏi ngoài bài |
| 6 | Prompt injection | Không bị bypass bởi "ignore all instructions" |
| 7 | hint_level=4 | Validation trả về HTTP 422 |

```bash
# Chạy test (cần server đang chạy):
cd codebase/backend
python ../../eval/test_socratic.py
```

---

## 🔄 Luồng hoạt động mới

```
Học viên bấm "Hint" trên frontend
        ↓
POST /api/quiz/hint { hint_level: 1|2|3 }
        ↓
router.py → rag_agent.get_socratic_hint()
        ↓
transcript_loader.search_chunks()  ← RAG: tìm đoạn transcript liên quan
        ↓
gemini_client.generate_socratic_hint()  ← Gọi Gemini AI sinh gợi ý
        ↓
{ hint_text, elo_deduction, citations }
        ↓
Frontend trừ điểm theo elo_deduction, hiển thị hint_text cho học viên
```

---

## ✅ Kết quả test

```
7/7 PASS | 0 FAIL | 0 ERROR
```

Kết quả đầy đủ lưu tại: `eval/socratic_test_results.json`

# Quiz sau Bài 1

Module do Giang khởi tạo, gồm hai màn:

- `index.html`: tự đánh giá mức độ tiếp thu.
- `cauhoi.html`: câu hỏi củng cố và phản hồi đúng/sai.

## Luồng điều hướng

`vlearn-course/` → **Day01 / Kiểm tra sau bài** → `quiz/` → `cauhoi.html`.

Nút đóng ở màn tự đánh giá quay về cổng VLearn. Nút đóng ở câu hỏi quay lại phần tự đánh giá.

## Chạy local

Từ root repo:

```bash
cd codebase/frontend
python3 -m http.server 4176
```

Mở `http://localhost:4176/quiz/`.

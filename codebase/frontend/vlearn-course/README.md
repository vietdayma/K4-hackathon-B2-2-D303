# VLearn Course Gateway

Trang tĩnh mô phỏng cổng khóa học VLearn cho COMP2010. Visual của trang này chủ ý giữ theo VLearn (navy/red, course accordion), không dùng style Duolingo của `warmup-ai`.

## Chạy local

Từ root repo:

```bash
python3 -m http.server 4173
```

Mở `http://localhost:4173/codebase/frontend/vlearn-course/`. Chạy từ root giúp các link PDF và transcript trong `data/vlearn-pack/` hoạt động đúng.

## Luồng

- Click một Day để mở các hành động.
- Day01 → **Chuẩn bị trước buổi học** dẫn tới `../warmup-ai/index.html`.
- **Đọc slide** sổ ngăn tài liệu bên dưới; PDF/transcript trỏ tới file hiện có trong `data/vlearn-pack/`.
- **Câu hỏi sau buổi học** lưu câu hỏi mock vào `localStorage` của trình duyệt.

Day02–Day06 giữ cùng cấu trúc để thêm warm-up riêng khi nội dung từng ngày sẵn sàng.

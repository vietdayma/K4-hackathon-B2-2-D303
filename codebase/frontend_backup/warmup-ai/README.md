# AI Warm-up — Bài 1

Warm-up tương tác trước buổi học AI: 5 tình huống, tỷ lệ chọn mock, thảo luận cộng đồng local và trang Key moments.

## Chạy local

Từ root repo:

```bash
cd codebase/frontend
python3 -m http.server 4176
```

Mở `http://localhost:4176/warmup-ai/`.

## File chính

- `index.html`: khung semantic, header/footer và dialog thoát.
- `styles.css`: token, responsive layout, component state và reduced motion.
- `app.js`: data scene, render state machine, mock comments/replies/reactions.
- `assets/`: runtime Lottie và mascot cho prototype.

## Quy ước product

- Không có câu trả lời đúng/sai; kết quả là tỉ lệ mock tổng bằng 100%.
- Trong lượt làm chỉ có nút **Thoát**; thao tác này luôn đi qua cảnh báo xoá tiến độ trước khi về sảnh chờ.
- Dữ liệu thảo luận dùng `localStorage`, vì vậy chỉ hiện trong trình duyệt hiện tại. Muốn đồng bộ cả lớp cần API/database riêng.
- Đừng xóa luồng exit confirmation, keyboard shortcuts hay `prefers-reduced-motion` khi mở rộng.

## Asset notice

Các file mascot Duolingo trong `assets/duolingo-lottie/` chỉ được giữ cho prototype nội bộ của team. Không phát hành public hay dùng cho sản phẩm nếu chưa có quyền sử dụng phù hợp; khi public cần thay bằng asset có license rõ ràng.

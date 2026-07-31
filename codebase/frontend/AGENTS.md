# Quy ước frontend chung

Đọc file này trước khi tạo hoặc sửa giao diện trong `codebase/frontend/`.

Ngữ cảnh sản phẩm và nguyên tắc chiến lược nằm tại [`../../PRODUCT.md`](../../PRODUCT.md).

## 1. Cấu trúc và phạm vi

- Mỗi giao diện là một thư mục độc lập: `codebase/frontend/<ten-kebab-case>/`.
- Không sửa backend, data, eval hay giao diện khác khi task chỉ nói tới một màn hình.
- Các giao diện hiện có (`warmup-ai/`, `vlearn-course/`) là static HTML/CSS/JavaScript, không cần Node hay build step.
- Nếu một UI mới cần framework, đặt source, lệnh chạy và asset của nó gọn trong thư mục UI đó; không làm thay đổi UI đang có.

## 2. Hệ visual theo từng interface

Mỗi interface có hệ visual riêng. Không mang token, mascot hay cách trình bày của UI này sang UI khác chỉ để "đồng bộ".

### `warmup-ai/`

Source of truth: `warmup-ai/styles.css` và `warmup-ai/README.md`.

- Nền sáng: `--canvas`; surface trắng: `--surface`; chữ chính: `--ink`.
- Xanh lá `--leaf` chỉ dành cho CTA chính và tiến độ. Xanh trời `--sky` dành cho chọn lựa/trạng thái thông tin trung tính.
- Không dùng xanh/đỏ để đánh giá câu trả lời đúng hoặc sai. Tỷ lệ lựa chọn là phản chiếu quan điểm lớp.
- Card/answer: viền 2px, đáy cứng 4px, radius 12–16px. Không dùng bóng mờ rộng, gradient text hay glassmorphism.
- Font: `ui-rounded, "Trebuchet MS", system-ui, sans-serif`. Heading 700; body thường 600–700; tránh chữ siêu đậm hoặc quá lớn.
- Giữ khoảng cách theo bội số 8px; chữ quan trọng là HTML, không đặt trong ảnh.

### `vlearn-course/`

Source of truth: `vlearn-course/styles.css` và `vlearn-course/README.md`.

- Đây là cổng khóa học tĩnh mô phỏng VLearn: header trắng/navy, trạng thái active đỏ, canvas xanh xám rất nhạt và accordion khóa học trắng.
- Không dùng mascot, màu xanh lá CTA, card đáy cứng hoặc hiệu ứng "game lesson" của `warmup-ai/` ở trang này.
- Các Day là accordion; hành động và tài liệu phải xổ ngay dưới đúng Day đang chọn, không điều hướng người học lạc khỏi danh sách trừ link đi vào warm-up/tài liệu.
- Duy trì ba hành động trong mỗi Day: chuẩn bị trước buổi học, đọc slide và câu hỏi sau buổi học. Chỉ Day đã có nội dung mới được link sang warm-up thật.

## 3. Bố cục và hành vi của `warmup-ai/`

- Mục tiêu chính là trình chiếu laptop 16:9. Luôn kiểm tra ít nhất tại 1366×768 và màn hẹp 820px.
- Header và footer CTA là khung cố định; trung tâm màn hình chỉ giải quyết một quyết định chính.
- Hội thoại: mỗi nhân vật chỉ có một balloon cho trọn lượt nói. Text có thể gõ dần; Space/CTA phải cho phép hiện ngay toàn bộ câu.
- Trong lượt làm, nút Thoát bắt buộc mở cảnh báo trước khi xoá tiến độ.
- Luồng điều hướng phải khép kín: `vlearn-course/` dẫn vào `warmup-ai/`, và warm-up luôn có đường quay về khóa học; nếu đang làm bài thì phải cảnh báo trước khi rời.
- Discussion dùng interaction quen thuộc: form đăng bình luận, reaction toggle, reply inline. Nếu chưa có backend, nói rõ dữ liệu là mock/local.
- Dialog/confirmation dùng native `<dialog>` khi phù hợp; không tự dựng overlay thiếu focus handling.

## 4. Motion và accessibility (mọi interface)

- Motion chỉ dùng để biểu đạt trạng thái: người đang nói, lựa chọn đã chọn, kết quả xuất hiện, dialog mở.
- Tôn trọng `prefers-reduced-motion`; không buộc người dùng chờ animation mới thao tác được.
- Mọi hành động bằng chuột phải có keyboard tương đương, focus thấy rõ, target bấm tối thiểu 44px và màu không là tín hiệu duy nhất.
- Sau mỗi thay đổi UI: mở trang, thử luồng chính, kiểm tra console không lỗi và không để text tràn card.

## 5. Asset và quyền sử dụng

- `warmup-ai/assets/duolingo-lottie/` chỉ phục vụ prototype nội bộ; không tái dùng, phân phối công khai hay coi như asset của team nếu chưa có quyền phù hợp.
- Không tạo asset "trông giống" mascot để lách quyền. Nếu sản phẩm cần public, thay bằng mascot có license rõ ràng.
- Asset mới phải được đặt trong thư mục UI đang dùng và ghi nguồn/license trong README của UI.

## 6. Handoff cho agent tiếp theo

- Đọc `AGENTS.md`, rồi README của đúng UI trước khi sửa code.
- Giữ source code tự giải thích được: state/data ở đầu `app.js`, render/event handlers tách rõ, không nhét CSS inline.
- Chỉ commit file nằm trong UI được giao và tài liệu liên quan trực tiếp. Không reset hoặc format lại phần của người khác.
- Commit message theo mẫu: `feat(warmup-ai): ...`, `fix(warmup-ai): ...`, hoặc `docs(frontend): ...`.

# Nối form tư vấn với Google Sheets + email báo về

Mất khoảng 10 phút, miễn phí, chỉ cần một tài khoản Google.

## Bước 1 – Tạo Google Sheet
1. Vào https://sheets.new (đăng nhập bằng tài khoản Google bạn muốn nhận thông báo).
2. Đặt tên, ví dụ: **Minh Travel – Khách đăng ký**.

## Bước 2 – Dán mã Apps Script
1. Trong Sheet, chọn **Tiện ích mở rộng → Apps Script**.
2. Xoá hết nội dung có sẵn trong `Mã.gs` / `Code.gs`.
3. Mở file `google-apps-script.gs` (cùng thư mục với trang web), copy toàn bộ và dán vào.
4. (Tuỳ chọn) Muốn nhận email ở địa chỉ khác, sửa dòng `const NOTIFY_EMAIL = '';` thành email đó.
5. Bấm biểu tượng 💾 **Lưu**.

## Bước 3 – Cấp quyền và chạy thử
1. Ở thanh công cụ, chọn hàm **testSubmit** rồi bấm **▶ Chạy**.
2. Google sẽ hỏi cấp quyền → **Xem xét quyền** → chọn tài khoản của bạn.
   - Nếu hiện "Google chưa xác minh ứng dụng này": bấm **Nâng cao → Đi tới … (không an toàn)**. Đây là script do chính bạn tạo nên an toàn.
3. Bấm **Cho phép**.
4. Quay lại Sheet: sẽ có trang tính **Khách đăng ký** với 1 dòng "Khách Thử", và Gmail nhận được 1 email báo. Xoá dòng thử đi.

## Bước 4 – Triển khai thành Web App
1. Bấm **Triển khai → Tùy chọn triển khai mới**.
2. Bấm ⚙️ cạnh "Chọn loại" → **Ứng dụng web**.
3. Thiết lập:
   - **Thực thi với tư cách:** Tôi (email của bạn)
   - **Người có quyền truy cập:** **Bất kỳ ai**
4. Bấm **Triển khai** và copy **URL ứng dụng web** (dạng `https://script.google.com/macros/s/AKfy.../exec`).

## Bước 5 – Gắn link vào trang web
Mở `index.html`, tìm dòng:

```js
let FORM_ENDPOINT = 'DAN_LINK_APPS_SCRIPT_VAO_DAY';
```

thay bằng link vừa copy, ví dụ:

```js
let FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfy.../exec';
```

Lưu file, mở trang, điền form thử → kiểm tra Sheet và Gmail.

## Lưu ý
- **Sửa mã Apps Script sau này:** phải vào **Triển khai → Quản lý các lần triển khai → ✏️ Chỉnh sửa → Phiên bản: Phiên bản mới → Triển khai** thì thay đổi mới có hiệu lực (link giữ nguyên).
- Cột **Trạng thái** mặc định là "Mới", bạn tự đổi thành "Đã gọi", "Đã chốt"... để theo dõi.
- Gmail miễn phí gửi được khoảng 100 email thông báo/ngày, dư dùng cho landing page.
- Form có sẵn ô ẩn chống bot spam; nếu gửi lỗi, khách sẽ thấy thông báo kèm link Zalo để liên hệ trực tiếp.

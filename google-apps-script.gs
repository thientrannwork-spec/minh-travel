/**
 * Minh Travel – nhận form tư vấn từ landing page
 * - Ghi mỗi lượt gửi thành 1 dòng trong sheet "Khách đăng ký"
 * - Gửi email báo về cho chủ tài khoản Google đang chạy script
 *
 * Cách dùng: xem file HUONG-DAN-GOOGLE-SHEETS.md
 */

// Email nhận thông báo. Để trống = gửi về chính tài khoản Google đã triển khai script.
const NOTIFY_EMAIL = '';
const SHEET_NAME = 'Khách đăng ký';
const HEADERS = ['Thời gian', 'Họ và tên', 'SĐT / Zalo', 'Email', 'Hành trình quan tâm',
                 'Thời gian dự kiến', 'Số lượng', 'Lời nhắn', 'Trang gửi', 'Trạng thái'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const p = (e && e.parameter) || {};

    // Chống spam: ô ẩn "website" mà có dữ liệu thì là bot
    if (p.website) return json_({ ok: true });

    const name = clean_(p.name, 100);
    // SĐT chỉ giữ số, dấu +, khoảng trắng và dấu chấm
    const phone = String(p.phone || '').replace(/[^\d+ .]/g, '').trim().slice(0, 30);
    if (!name || !phone) return json_({ ok: false, error: 'missing_fields' });

    const row = [
      new Date(),
      name,
      '', // SĐT ghi riêng bên dưới dạng chữ (tránh "+84..." bị hiểu là công thức)
      clean_(p.email, 120),
      clean_(p.interest, 120),
      clean_(p.date, 120),
      clean_(p.size, 60),
      clean_(p.message, 2000),
      clean_(p.page, 300),
      'Mới'
    ];

    const sheet = getSheet_();
    sheet.appendRow(row);
    // Định dạng số điện thoại dạng chữ để không mất số 0 đầu
    sheet.getRange(sheet.getLastRow(), 3).setNumberFormat('@').setValue(phone);

    row[2] = phone;
    sendNotify_(row);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Mở link /exec trên trình duyệt để kiểm tra script đang chạy
function doGet() {
  return json_({ ok: true, message: 'Minh Travel form endpoint đang hoạt động' });
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold').setBackground('#00652c').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
    sheet.getRange('C:C').setNumberFormat('@');
  }
  return sheet;
}

function sendNotify_(row) {
  const to = NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
  if (!to) return;
  const [time, name, phone, email, interest, date, size, message] = row;
  const zaloPhone = phone.replace(/[^0-9]/g, '').replace(/^84/, '0');
  const body =
    'Có khách mới đăng ký tư vấn trên landing page:\n\n' +
    'Họ tên: ' + name + '\n' +
    'SĐT / Zalo: ' + phone + '\n' +
    'Email: ' + (email || '—') + '\n' +
    'Hành trình: ' + interest + '\n' +
    'Thời gian dự kiến: ' + (date || '—') + '\n' +
    'Số lượng: ' + size + '\n' +
    'Lời nhắn: ' + (message || '—') + '\n\n' +
    'Nhắn Zalo ngay: https://zalo.me/' + zaloPhone + '\n' +
    'Xem bảng: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl();
  const mail = { to: to, subject: '🧭 Khách mới: ' + name + ' – ' + interest, body: body };
  if (email && /@/.test(email)) mail.replyTo = email;
  MailApp.sendEmail(mail);
}

function clean_(v, max) {
  let s = String(v == null ? '' : v).trim().slice(0, max);
  // Chặn công thức bị chèn vào Sheet (=, +, -, @)
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Chạy hàm này 1 lần trong trình soạn thảo để cấp quyền và thử ghi 1 dòng mẫu
function testSubmit() {
  const res = doPost({ parameter: {
    name: 'Khách Thử', phone: '0912000000', email: '',
    interest: 'Tour Trong Nước', date: 'Tháng 12', size: '02 - 04 khách',
    message: 'Dòng thử nghiệm – có thể xoá', page: 'test'
  }});
  console.log('Kết quả: ' + res.getContent()); // {"ok":true} là thành công
}

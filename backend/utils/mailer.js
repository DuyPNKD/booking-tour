// utils/mailer.js
const nodemailer = require("nodemailer");
const dayjs = require("dayjs");
require("dayjs/locale/vi");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Gửi email chung
 */
async function sendEmail(to, subject, html) {
    await transporter.sendMail({
        from: `"DTravel" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    });
}

/**
 * Gửi email xác thực tài khoản
 */
async function sendVerificationEmail(to, code) {
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; margin: auto;">
            <h2 style="color: #2c3e50; text-align: center;">XÁC THỰC ĐĂNG KÝ</h2>
            <p>Kính chào Quý khách,</p>
            <p>Mã OTP để hoàn tất quá trình đăng ký của Quý khách là:</p>
            <p style="font-size: 24px; font-weight: bold; color: #e74c3c;">${code}</p>
            <p>Mã sẽ hết hạn sau <strong>5 phút</strong>.</p>
            <p>Nếu Quý khách không yêu cầu đăng ký, vui lòng bỏ qua email này.</p>
            <br>
            <p>Trân trọng,</p>
            <p><em>Tour App DTravel</em></p>
        </div>
    `;
    await sendEmail(to, "Xác thực đăng ký tài khoản", html);
}

/**
 * Gửi email đặt lại mật khẩu
 */

async function sendResetPasswordEmail(to, resetLink) {
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; margin: auto;">
            <h2 style="color: #2c3e50; text-align: center;">ĐẶT LẠI MẬT KHẨU</h2>
            <p>Xin chào Quý khách,</p>
            <p>Chúng tôi nhận được yêu cầu thiết lập lại mật khẩu cho tài khoản của bạn trên DTravel. Nếu bạn đã yêu cầu điều này, vui lòng nhấp vào liên kết bên dưới để thiết lập lại mật khẩu của bạn:</p>
            <p style="margin: 10px 0;">
                <a href="${resetLink}" style="color: #3498db; text-decoration: underline;">Thiết lập lại mật khẩu</a>
            </p>
            <p><strong>Lưu ý:</strong></p>
            <p>Liên kết trên sẽ hết hạn sau <strong>30 phút</strong> kể từ thời điểm yêu cầu.</p>
            <p>Nếu bạn không yêu cầu thiết lập lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn và không có thay đổi nào được thực hiện.</p>
            <p>Cảm ơn bạn đã sử dụng DTravel!</p>
        </div>
    `;
    await sendEmail(to, "Yêu cầu đặt lại mật khẩu trên DTravel", html);
}

/**
 * Gửi email xác nhận đơn hàng sau khi thanh toán thành công
 */
async function sendBookingConfirmationEmail(to, customerName, orderId, tourName, tourDate, amount) {
    const amountNumber = typeof amount === "number" ? amount : Number(amount);
    const formattedAmount = Number.isFinite(amountNumber) ? amountNumber.toLocaleString("vi-VN") : String(amount);
    const formattedDate = tourDate ? dayjs(tourDate).locale("vi").format("dddd, DD/MM/YYYY") : "";

    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const orderDetailUrl = `${frontendBaseUrl}/dashboard/trips?orderId=${encodeURIComponent(orderId)}`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; margin: auto;">
            <h2 style="color: #2c3e50; text-align: center;">XÁC NHẬN ĐƠN HÀNG</h2>
            <p>Xin chào <strong>${customerName}</strong>,</p>
            <p>Cảm ơn bạn đã đặt tour tại <strong>DTravel</strong>. Đơn hàng của bạn đã được thanh toán và xác nhận.</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;"><strong>Mã đơn hàng</strong></td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${orderId}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;"><strong>Tên tour</strong></td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${tourName}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;"><strong>Ngày khởi hành</strong></td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-transform: capitalize;">${formattedDate}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;"><strong>Thành tiền</strong></td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${formattedAmount} đ</td>
                </tr>
            </table>
            <div style="text-align:center; margin-top: 24px;">
                <a href="${orderDetailUrl}" style="display:inline-block; background:#1677ff; color:#fff; padding:10px 16px; border-radius:6px; text-decoration:none;">
                    Xem chi tiết đơn hàng
                </a>
            </div>
            <p style="margin-top: 15px;">Chúng tôi rất mong bạn có một chuyến đi tuyệt vời!</p>
            <br>
            <p>Trân trọng,</p>
            <p><em>Tour App DTravel</em></p>
        </div>
    `;
    await sendEmail(to, "Xác nhận đơn hàng DTravel", html);
}

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendResetPasswordEmail,
    sendBookingConfirmationEmail,
};

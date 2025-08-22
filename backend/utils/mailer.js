// utils/mailer.js
const nodemailer = require("nodemailer");

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

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendResetPasswordEmail,
};

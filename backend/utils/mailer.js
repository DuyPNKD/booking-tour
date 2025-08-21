const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // hoặc 587
    secure: true, // true cho 465, false cho 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendVerificationEmail(to, code) {
    await transporter.sendMail({
        from: `"Tour App DTravel" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Mã xác thực tài khoản",
        text: `Mã xác thực của bạn là: ${code}`,
        html: `<p>Mã xác thực của bạn là: <b>${code}</b></p>`,
    });
}

module.exports = {sendVerificationEmail};

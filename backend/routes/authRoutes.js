const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {sendVerificationEmail} = require("../utils/mailer");

router.get("/ping", (req, res) => {
    res.send("Auth route OK");
});

// 📌 Đăng ký
router.post("/register", async (req, res) => {
    try {
        // console.log("Request body:", req.body); // 👀 log ra để debug
        const {name, emailOrPhone, password} = req.body;
        const email = emailOrPhone; // ✅ gán lại cho dễ hiểu

        // 1. Check trùng email/phone
        const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(400).json({message: "Email đã tồn tại"});
        }

        // 2. Mã hoá mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Lưu user với is_active = 0
        const [result] = await db.query("INSERT INTO users (name, email, password, is_active) VALUES (?, ?, ?, 0)", [name, email, hashedPassword]);
        const userId = result.insertId;

        // 4. Sinh mã OTP (6 số)
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // hết hạn sau 5 phút

        await db.query("INSERT INTO user_verifications (user_id, code, expires_at) VALUES (?, ?, ?)", [userId, code, expiresAt]);

        // 5. Gửi email
        await sendVerificationEmail(email, code);

        res.status(201).json({message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực."});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Lỗi server"});
    }
});

// 📌 Đăng nhập
router.post("/login", async (req, res) => {
    try {
        const {emailOrPhone, password} = req.body;
        console.log("Login attempt with:", {emailOrPhone, password});
        // 1. Tìm user theo email/phone
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [emailOrPhone]);
        if (users.length === 0) {
            return res.status(400).json({message: "Email không tồn tại"});
        }

        const user = users[0];

        // 2. So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({message: "Sai mật khẩu"});
        }

        // 3. Tạo token
        const payload = {id: user.id, name: user.name, email: user.email};
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "7d"});

        // 4. Trả về token + thông tin user
        res.json({token, user: payload});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Lỗi server"});
    }
});

// 📌 Lấy thông tin user từ token
router.get("/me", authMiddleware, async (req, res) => {
    try {
        // req.user được gắn từ middleware (giải mã từ token)
        res.json({user: req.user});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Lỗi server"});
    }
});

// 📌 Xác thực tài khoản
router.post("/verify", async (req, res) => {
    try {
        const {email, code} = req.body;

        // 1. Lấy user
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) return res.status(400).json({message: "Không tìm thấy user"});
        const user = users[0];

        // 2. Lấy OTP mới nhất
        const [verifications] = await db.query("SELECT * FROM user_verifications WHERE user_id = ? ORDER BY id DESC LIMIT 1", [user.id]);
        if (verifications.length === 0) return res.status(400).json({message: "Chưa có mã xác thực"});

        const verification = verifications[0];

        // 3. Check mã
        if (verification.code !== code) {
            return res.status(400).json({message: "Mã xác thực không đúng"});
        }

        // 4. Check hạn
        if (new Date() > new Date(verification.expires_at)) {
            return res.status(400).json({message: "Mã xác thực đã hết hạn"});
        }

        // 5. Update active
        await db.query("UPDATE users SET is_active = 1 WHERE id = ?", [user.id]);

        // 6. Sinh JWT token
        const token = jwt.sign(
            {id: user.id, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn: "7d"} // token sống 7 ngày
        );

        // 7. Trả về cho frontend
        res.json({
            message: "Xác thực thành công, tài khoản đã được kích hoạt",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Lỗi server"});
    }
});

// 📌 Resend OTP
router.post("/resend-otp", async (req, res) => {
    try {
        const {email} = req.body;

        if (!email) {
            return res.status(400).json({message: "Email là bắt buộc"});
        }

        // 1. Kiểm tra user tồn tại chưa
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(404).json({message: "Người dùng không tồn tại"});
        }

        const user = users[0];

        // 2. Sinh OTP mới (6 số ngẫu nhiên)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Lưu OTP và hạn sử dụng (5 phút)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await db.query("UPDATE users SET otp_code = ?, otp_expires = ? WHERE id = ?", [otp, expiresAt, user.id]);

        // 4. Gửi email
        await sendVerificationEmail(email, otp);

        res.json({message: "Đã gửi lại mã xác thực qua email!"});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Lỗi server khi gửi lại mã"});
    }
});

module.exports = router;

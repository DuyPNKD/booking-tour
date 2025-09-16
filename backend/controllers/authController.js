const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../config/db");
const {sendVerificationEmail, sendResetPasswordEmail} = require("../utils/mailer");
const {OAuth2Client} = require("google-auth-library");
require("dotenv").config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Auth Controller
 * Chứa các handler liên quan đến xác thực/người dùng cho khu vực người dùng (frontend)
 */

/**
 * Đăng ký tài khoản người dùng
 * Route: POST /api/auth/register
 * Body: { name, emailOrPhone, password }
 * - Kiểm tra trùng email
 * - Hash mật khẩu, tạo user với is_active = 0
 * - Sinh OTP 6 số, lưu vào user_verifications, gửi email xác thực
 * Response: 201 + message hướng dẫn xác thực
 */
exports.register = async function (req, res) {
    try {
        // Bước 1: Lấy dữ liệu từ request
        const {name, emailOrPhone, password} = req.body;
        const email = emailOrPhone;

        // Bước 2: Kiểm tra email có tồn tại hay không
        const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(400).json({message: "Email đã tồn tại"});
        }

        // Bước 3: Hash mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Bước 4: Tạo user mới với trạng thái chưa kích hoạt
        const [result] = await db.query("INSERT INTO users (name, email, password, is_active) VALUES (?, ?, ?, 0)", [name, email, hashedPassword]);
        const userId = result.insertId;

        // Bước 5: Sinh OTP 6 số và lưu vào bảng user_verifications
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await db.query("INSERT INTO user_verifications (user_id, code, expires_at) VALUES (?, ?, ?)", [userId, code, expiresAt]);

        // Bước 6: Gửi email xác thực
        await sendVerificationEmail(email, code);

        // Bước 7: Trả về phản hồi thành công
        res.status(201).json({message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực."});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Lỗi server"});
    }
};

/**
 * Đăng nhập người dùng
 * Route: POST /api/auth/login
 * Body: { email, password }
 */
exports.login = async function (req, res) {
    try {
        // Bước 1: Kiểm tra nhập liệu
        const {email, password} = req.body || {};
        if (!email || !password) {
            return res.status(400).json({message: "Email và mật khẩu là bắt buộc"});
        }

        // Bước 2: Lấy thông tin user từ DB
        const [rows] = await db.query("SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1", [email]);
        if (!rows || rows.length === 0) {
            return res.status(401).json({message: "Unauthorized"});
        }
        const user = rows[0];

        // Bước 3: So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({message: "Unauthorized"});
        }

        // Bước 4: Sinh JWT và trả về kết quả
        const payload = {id: user.id, email: user.email, role: user.role};
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1h"});
        return res.json({
            token,
            user: {id: user.id, name: user.name, email: user.email, role: user.role},
        });
    } catch (err) {
        console.error("/api/auth/login lỗi:", err);
        return res.status(500).json({message: "Lỗi server"});
    }
};

/**
 * Lấy thông tin user từ JWT đã được giải mã qua middleware
 * Route: GET /api/auth/me
 */
exports.me = async function (req, res) {
    try {
        // Bước 1: Trả về thông tin user từ middleware
        res.json({user: req.user});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Lỗi server"});
    }
};

/**
 * Cập nhật hồ sơ người dùng
 * Route: PUT /api/auth/me (yêu cầu đăng nhập)
 */
exports.updateProfile = async function (req, res) {
    try {
        // Bước 1: Lấy id và dữ liệu cập nhật từ request
        const userId = req.user.id;
        const {name, phone, address, gender, birthDay, birthMonth, birthYear} = req.body;
        const fields = [];
        const params = [];
        if (name) {
            fields.push("name = ?");
            params.push(name);
        }
        if (phone) {
            fields.push("phone = ?");
            params.push(phone);
        }
        if (address) {
            fields.push("address = ?");
            params.push(address);
        }
        if (gender) {
            fields.push("gender = ?");
            params.push(gender);
        }
        if (birthDay && birthMonth && birthYear) {
            const birthDate = `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`;
            fields.push("birth_date = ?");
            params.push(birthDate);
        }

        // Bước 2: Cập nhật thông tin nếu có thay đổi
        if (fields.length > 0) {
            params.push(userId);
            await db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, params);
        }

        // Bước 3: Lấy lại thông tin user đã cập nhật
        const [[user]] = await db.query("SELECT id, name, email, phone, address, gender, birth_date FROM users WHERE id = ?", [userId]);
        res.json({success: true, user});
    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({success: false, message: "Lỗi cập nhật hồ sơ"});
    }
};

/**
 * Xác thực tài khoản bằng OTP
 * Route: POST /api/auth/verify
 * Body: { email, code }
 * - Kiểm tra OTP gần nhất và hạn sử dụng
 * - Đặt is_active = 1 nếu hợp lệ
 * - Sinh JWT cho user
 * Response: { message, token, user }
 */
exports.verify = async function (req, res) {
    try {
        // Bước 1: Lấy dữ liệu email và OTP từ request
        const {email, code} = req.body;

        // Bước 2: Kiểm tra user theo email
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) return res.status(400).json({message: "Không tìm thấy user"});
        const user = users[0];

        // Bước 3: Lấy mã OTP mới nhất của user
        const [verifications] = await db.query("SELECT * FROM user_verifications WHERE user_id = ? ORDER BY id DESC LIMIT 1", [user.id]);
        if (verifications.length === 0) return res.status(400).json({message: "Chưa có mã xác thực"});
        const verification = verifications[0];

        // Bước 4: Kiểm tra mã OTP và thời gian hết hạn
        if (verification.code !== code) {
            return res.status(400).json({message: "Mã xác thực không đúng"});
        }
        if (new Date() > new Date(verification.expires_at)) {
            return res.status(400).json({message: "Mã xác thực đã hết hạn"});
        }

        // Bước 5: Kích hoạt user và sinh token JWT
        await db.query("UPDATE users SET is_active = 1 WHERE id = ?", [user.id]);
        const token = jwt.sign({id: user.id, email: user.email}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
        res.json({
            message: "Xác thực thành công, tài khoản đã được kích hoạt",
            token,
            user: {id: user.id, name: user.name, email: user.email},
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Lỗi server"});
    }
};

/**
 * Gửi lại mã OTP kích hoạt tài khoản
 * Route: POST /api/auth/resend-otp
 * Body: { email }
 * - Xoá OTP cũ, tạo OTP mới, lưu và gửi email
 * Response: { message }
 */
exports.resendOtp = async function (req, res) {
    try {
        // Bước 1: Kiểm tra tồn tại email trong request
        const {email} = req.body;
        if (!email) return res.status(400).json({message: "Email là bắt buộc"});

        // Bước 2: Lấy thông tin user theo email
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) return res.status(404).json({message: "Người dùng không tồn tại"});
        const user = users[0];

        // Bước 3: Sinh mã OTP và cập nhật bảng user_verifications
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await db.query("DELETE FROM user_verifications WHERE user_id = ?", [user.id]);
        await db.query("INSERT INTO user_verifications (user_id, code, expires_at) VALUES (?, ?, ?)", [user.id, otp, expiresAt]);

        // Bước 4: Gửi email xác thực
        await sendVerificationEmail(email, otp);
        res.json({message: "Đã gửi lại mã xác thực qua email!"});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Lỗi server khi gửi lại mã"});
    }
};

/**
 * Gửi link đặt lại mật khẩu qua email
 * Route: POST /api/auth/forgot-password
 * Body: { email }
 * - Tạo token đặt lại mật khẩu có hạn, lưu vào password_resets
 * - Gửi email chứa link reset
 * Response: { message }
 */
exports.forgotPassword = async function (req, res) {
    // Bước 1: Lấy email và kiểm tra user tồn tại
    const {email} = req.body;
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user) return res.status(400).json({message: "Email không tồn tại"});

    // Bước 2: Sinh token đặt lại mật khẩu và lưu vào bảng
    const token = crypto.randomBytes(32).toString("hex");
    const expireTime = new Date(Date.now() + 30 * 60 * 1000);
    await db.query("INSERT INTO password_resets (user_id, token, expire_at) VALUES (?, ?, ?)", [user.id, token, expireTime]);

    // Bước 3: Gửi email chứa link reset
    const resetLink = `http://localhost:5173/auth/login?step=reset-password&token=${token}`;
    await sendResetPasswordEmail(email, resetLink);
    res.json({message: "Link đặt lại mật khẩu đã gửi đến email"});
};

/**
 * Đặt lại mật khẩu bằng token hợp lệ
 * Route: POST /api/auth/reset-password
 * Body: { token, newPassword }
 * - Xác thực token còn hạn trong bảng password_resets
 * - Hash và cập nhật mật khẩu mới, xoá token
 * Response: { message }
 */
exports.resetPassword = async function (req, res) {
    try {
        // Bước 1: Kiểm tra token và mật khẩu mới
        const {token, newPassword} = req.body;
        if (!token || !newPassword) return res.status(400).json({message: "Thiếu token hoặc mật khẩu mới"});

        // Bước 2: Xác thực token trong bảng password_resets
        const [rows] = await db.query("SELECT * FROM password_resets WHERE token = ? AND expire_at > NOW() LIMIT 1", [token]);
        const resetRecord = rows[0];
        if (!resetRecord) return res.status(400).json({message: "Token không hợp lệ hoặc đã hết hạn"});

        // Bước 3: Hash mật khẩu mới và cập nhật cho user
        const bcryptjs = require("bcryptjs");
        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, resetRecord.user_id]);

        // Bước 4: Xoá token đã sử dụng
        await db.query("DELETE FROM password_resets WHERE user_id = ?", [resetRecord.user_id]);
        res.json({message: "Đổi mật khẩu thành công, hãy đăng nhập lại"});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Lỗi server"});
    }
};

/**
 * Kiểm tra trạng thái token đặt lại mật khẩu
 * Route: POST /api/auth/check-reset-token
 * Body: { token }
 */
exports.checkResetToken = async function (req, res) {
    // Bước 1: Lấy token từ request
    const {token} = req.body;
    if (!token) return res.status(400).json({message: "Thiếu token"});
    try {
        // Bước 2: Lấy thông tin token từ bảng password_resets
        const [rows] = await db.query("SELECT * FROM password_resets WHERE token = ?", [token]);
        const record = rows[0];
        if (!record) return res.status(400).json({message: "Token không tồn tại"});
        const expireTime = new Date(record.expire_at);
        const now = new Date();
        if (expireTime < now) return res.status(400).json({message: "Token đã hết hạn"});

        // Bước 3: Lấy email của user tương ứng
        const [users] = await db.query("SELECT email FROM users WHERE id = ?", [record.user_id]);
        if (!users || users.length === 0) return res.status(400).json({message: "Không tìm thấy user tương ứng"});
        return res.json({message: "Token hợp lệ", email: users[0].email});
    } catch (err) {
        console.error("❌ Lỗi check-reset-token:", err);
        return res.status(500).json({message: "Lỗi server"});
    }
};

/**
 * Đăng nhập bằng Google OAuth token
 * Route: POST /api/auth/google
 * Body: { token }
 */
exports.googleLogin = async function (req, res) {
    // Bước 1: Lấy token từ request
    const {token} = req.body;
    try {
        // Bước 2: Xác thực Google token và lấy payload
        const ticket = await googleClient.verifyIdToken({idToken: token, audience: process.env.GOOGLE_CLIENT_ID});
        const payload = ticket.getPayload();
        const {email, name, picture} = payload;

        // Bước 3: Kiểm tra tồn tại user theo email
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        let user;
        if (rows.length === 0) {
            // Bước 4: Nếu không có, tạo mới user
            const [result] = await db.query("INSERT INTO users (name, email, is_active, role, avatar) VALUES (?, ?, ?, ?, ?)", [name, email, 1, "user", picture]);
            user = {id: result.insertId, name, email, role: "user", picture};
        } else {
            // Bước 5: Nếu có, lấy thông tin user
            user = {id: rows[0].id, name: rows[0].name, email: rows[0].email, role: rows[0].role, picture};
        }
        // Bước 6: Sinh JWT và trả về kết quả
        const accessToken = jwt.sign({id: user.id, email: user.email, role: user.role}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
        res.json({accessToken, user});
    } catch (err) {
        console.error("Lỗi đăng nhập Google:", err);
        res.status(401).json({message: "Token Google không hợp lệ"});
    }
};

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const crypto = require("crypto");
require("dotenv").config();
const router = express.Router();
const {OAuth2Client} = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authMiddleware = require("../middlewares/authMiddleware");
const {sendVerificationEmail, sendResetPasswordEmail} = require("../utils/mailer");
const multer = require("multer"); // 1.Dùng thư viện Multer để nhận file từ FE
const path = require("path");

router.get("/ping", (req, res) => {
    res.send("Auth route OK");
});

// 2.Multer lưu file avatar vào folder uploads/avatars
const storage = multer.diskStorage({
    // Chỉ định thư mục lưu file upload
    destination: function (req, file, cb) {
        // Lưu vào thư mục uploads/avatars (tính từ gốc dự án)
        cb(null, path.join(__dirname, "../public/uploads/avatars"));
    },
    // Đặt tên file upload: userId-timestamp.ext (giúp tránh trùng tên)
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); // Lấy phần mở rộng file (.jpg, .png, ...)
        cb(null, req.user.id + "_" + Date.now() + ext); // Ví dụ: 12_1699999999999.jpg
    },
});
// Tạo middleware upload dùng cấu hình trên
const upload = multer({storage});

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
        const {email, password} = req.body;
        console.log("Login attempt with:", {email, password});
        // 1. Tìm user theo email/phone
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
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
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});

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

// 📌 Cập nhật hồ sơ
router.put("/me", authMiddleware, async (req, res) => {
    try {
        // Lấy id của user từ thông tin được gắn bởi authMiddleware (đã giải mã token)
        const userId = req.user.id;

        // Lấy dữ liệu cập nhật từ body request
        const {name, phone, address, gender, birthDay, birthMonth, birthYear} = req.body;

        // Tạo mảng lưu trữ các trường cần cập nhật và mảng chứa các giá trị tương ứng
        const fields = [];
        const params = [];

        // Nếu có giá trị name, thêm trường name vào mảng cập nhật
        if (name) {
            fields.push("name = ?");
            params.push(name);
        }
        // Nếu có giá trị phone, thêm trường phone vào mảng cập nhật
        if (phone) {
            fields.push("phone = ?");
            params.push(phone);
        }
        // Nếu có giá trị address, thêm trường address vào mảng cập nhật
        if (address) {
            fields.push("address = ?");
            params.push(address);
        }
        // Nếu có giá trị gender, thêm trường gender vào mảng cập nhật
        if (gender) {
            fields.push("gender = ?");
            params.push(gender);
        }
        // Nếu có đầy đủ ngày, tháng, năm sinh, tạo chuỗi ngày theo format 'YYYY-MM-DD'
        if (birthDay && birthMonth && birthYear) {
            const birthDate = `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`;
            fields.push("birth_date = ?");
            params.push(birthDate);
        }

        // Nếu có ít nhất 1 trường để cập nhật, thực hiện câu lệnh UPDATE
        if (fields.length > 0) {
            // Thêm userId vào cuối mảng params cho mệnh đề WHERE
            params.push(userId);
            // Xây dựng truy vấn UPDATE động dựa trên các trường được cung cấp từ request
            await db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, params);
        }

        // Sau khi cập nhật, truy vấn lại thông tin user để trả về cho client
        const [[user]] = await db.query("SELECT id, name, email, phone, address, gender, birth_date FROM users WHERE id = ?", [userId]);

        // Trả về thông báo thành công và thông tin user đã cập nhật
        res.json({success: true, user});
    } catch (err) {
        // Nếu có lỗi xảy ra, log lỗi và trả về thông báo lỗi cho client
        console.error("Update profile error:", err);
        res.status(500).json({success: false, message: "Lỗi cập nhật hồ sơ"});
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
        const token = jwt.sign({id: user.id, email: user.email}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});

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

        // Xóa OTP cũ nếu có
        await db.query("DELETE FROM user_verifications WHERE user_id = ?", [user.id]);

        // Thêm OTP mới
        await db.query("INSERT INTO user_verifications (user_id, code, expires_at) VALUES (?, ?, ?)", [user.id, otp, expiresAt]);

        // 4. Gửi email
        await sendVerificationEmail(email, otp);

        res.json({message: "Đã gửi lại mã xác thực qua email!"});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Lỗi server khi gửi lại mã"});
    }
});
// 📌 Quên mật khẩu
router.post("/forgot-password", async (req, res) => {
    const {email} = req.body;

    // 1. Kiểm tra email có trong DB không
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];

    if (!user) {
        return res.status(400).json({message: "Email không tồn tại"});
    }

    // 2. Tạo token có hạn (10-30 phút)
    const token = crypto.randomBytes(32).toString("hex");
    const expireTime = new Date(Date.now() + 30 * 60 * 1000); // 30 phút

    // Lưu token vào bảng password_resets
    await db.query("INSERT INTO password_resets (user_id, token, expire_at) VALUES (?, ?, ?)", [user.id, token, expireTime]);

    // 3. Gửi email cho user
    const resetLink = `http://localhost:5173/auth/login?step=reset-password&token=${token}`;

    await sendResetPasswordEmail(email, resetLink);

    res.json({message: "Link đặt lại mật khẩu đã gửi đến email"});
});

// 📌 Reset mật khẩu
router.post("/reset-password", async (req, res) => {
    try {
        const {token, newPassword} = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({message: "Thiếu token hoặc mật khẩu mới"});
        }

        // 1. Kiểm tra token trong bảng password_resets
        const [rows] = await db.query("SELECT * FROM password_resets WHERE token = ? AND expire_at > NOW() LIMIT 1", [token]);
        const resetRecord = rows[0];

        if (!resetRecord) {
            return res.status(400).json({message: "Token không hợp lệ hoặc đã hết hạn"});
        }

        // 2. Hash mật khẩu mới
        const bcrypt = require("bcryptjs");
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 3. Update mật khẩu user
        await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, resetRecord.user_id]);

        // 4. Xoá token để tránh dùng lại
        await db.query("DELETE FROM password_resets WHERE user_id = ?", [resetRecord.user_id]);

        res.json({message: "Đổi mật khẩu thành công, hãy đăng nhập lại"});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Lỗi server"});
    }
});

// 📌 Check Reset Token
router.post("/check-reset-token", async (req, res) => {
    const {token} = req.body;

    if (!token) {
        return res.status(400).json({message: "Thiếu token"});
    }

    try {
        // 1. Tìm token trong DB
        const [rows] = await db.query("SELECT * FROM password_resets WHERE token = ?", [token]);
        const record = rows[0];

        if (!record) {
            return res.status(400).json({message: "Token không tồn tại"});
        }

        // 2. So sánh thời gian hết hạn (MySQL DATETIME -> JS Date object)
        const expireTime = new Date(record.expire_at);
        const now = new Date();

        if (expireTime < now) {
            return res.status(400).json({message: "Token đã hết hạn"});
        }

        // 3. Lấy email user theo user_id trong bảng password_resets
        const [users] = await db.query("SELECT email FROM users WHERE id = ?", [record.user_id]);
        if (!users || users.length === 0) {
            return res.status(400).json({message: "Không tìm thấy user tương ứng"});
        }

        // 4. Nếu hợp lệ -> trả thêm email
        return res.json({
            message: "Token hợp lệ",
            email: users[0].email,
        });
    } catch (err) {
        console.error("❌ Lỗi check-reset-token:", err);
        return res.status(500).json({message: "Lỗi server"});
    }
});

router.post("/google", async (req, res) => {
    const {token} = req.body;

    try {
        // ✅ Verify token Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const {email, name, picture} = payload;

        // ✅ Kiểm tra user đã tồn tại chưa
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        let user;
        if (rows.length === 0) {
            // ✅ Nếu chưa có thì tạo user mới
            const [result] = await db.query("INSERT INTO users (name, email, is_active, role, avatar) VALUES (?, ?, ?, ?, ?)", [name, email, 1, "user", picture]);

            user = {
                id: result.insertId,
                name,
                email,
                role: "user",
                picture, // <- Google trả về, nhưng DB không lưu
            };
        } else {
            user = {
                id: rows[0].id,
                name: rows[0].name,
                email: rows[0].email,
                role: rows[0].role,
                picture, // <- Google trả về, nhưng DB không lưu
            };
        }

        // ✅ Sinh JWT
        const accessToken = jwt.sign({id: user.id, email: user.email, role: user.role}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        res.json({
            accessToken,
            user,
        });
    } catch (err) {
        console.error("Google login error:", err);
        res.status(401).json({message: "Token Google không hợp lệ"});
    }
});

// API upload avatar -> 3. BE trả về đường dẫn file cho FE.
router.post(
    "/upload/avatar",
    authMiddleware, // Kiểm tra đăng nhập, gắn req.user
    upload.single("avatar"), // Nhận file từ key "avatar" trong FormData
    (req, res) => {
        // Nếu không có file gửi lên
        if (!req.file) {
            return res.status(400).json({success: false, message: "Không có file được upload"});
        }
        // Tạo đường dẫn file vừa upload để trả về cho FE
        const filePath = "/uploads/avatars/" + req.file.filename;
        res.json({success: true, path: filePath});
    }
);

module.exports = router;

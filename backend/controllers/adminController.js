const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

/**
 * Đăng nhập cho Admin/Staff
 * Route: POST /api/admin/login
 * Body:
 *  - email: string (bắt buộc)
 *  - password: string (bắt buộc)
 * Quy trình:
 *  - Kiểm tra dữ liệu đầu vào
 *  - Tìm user theo email; trả về 401 nếu không tìm thấy
 *  - So sánh mật khẩu bằng bcrypt; trả về 401 nếu không khớp
 *  - Kiểm tra vai trò phải là 'admin' hoặc 'staff'; trả về 403 nếu không hợp lệ
 *  - Sinh access_token và refresh_token (1h) với payload {id, email, role}
 *
 * Kết quả:
 *  { token, user: { id, name, email, role } }
 */
exports.login = async function (req, res) {
    try {
        // Bước 1: Kiểm tra dữ liệu đầu vào
        const {email, password} = req.body || {};
        if (!email || !password) {
            return res.status(400).json({message: "Email và mật khẩu là bắt buộc"});
        }

        // Bước 2: Lấy thông tin user từ cơ sở dữ liệu
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

        // Bước 4: Kiểm tra role
        if (user.role !== "admin" && user.role !== "staff") {
            return res.status(403).json({message: "Forbidden"});
        }

        // Bước 5: Tạo JWT Token
        const payload = {id: user.id, email: user.email, role: user.role};

        // Access token (ngắn hạn)
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1h"});
        // Refresh token (dài hạn)
        const refreshToken = jwt.sign({id: user.id}, process.env.JWT_REFRESH_SECRET, {expiresIn: "7d"});

        // Lưu refresh token vào cookie (httpOnly, secure)
        // Gửi refreshToken về client thông qua Cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: false, // ✅ Cookie không thể bị truy cập bởi JavaScript (tránh XSS)
            secure: process.env.NODE_ENV === "production",
            // ✅ Chỉ gửi cookie qua HTTPS khi ở môi trường production
            //    (local dev dùng http nên để false để test)

            sameSite: "strict",
            // ✅ Cookie chỉ được gửi khi request từ cùng domain
            //    → giúp chống CSRF (Cross Site Request Forgery)

            maxAge: 7 * 24 * 60 * 60 * 1000,
            // ✅ Thời gian sống của cookie: 7 ngày (tính bằng milliseconds)
        });

        // Bước 6: Trả về token và thông tin user (không kèm password)

        return res.json({
            access_token: accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("/api/admin/login lỗi:", err);
        return res.status(500).json({message: "Lỗi server"});
    }
};

// ==== REFRESH TOKEN ====
exports.refresh = async function (req, res) {
    try {
        // 1. Lấy refresh token từ cookie
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({message: "Không có refresh token"});
        }

        // 2. Verify refresh token
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, payload) => {
            if (err) {
                return res.status(403).json({message: "Refresh token không hợp lệ hoặc đã hết hạn"});
            }

            // 3. Tạo access token mới
            const newAccessToken = jwt.sign({id: payload.id, email: payload.email, role: payload.role}, process.env.JWT_SECRET, {expiresIn: "15m"});

            return res.json({access_token: newAccessToken});
        });
    } catch (err) {
        console.error("/api/admin/refresh lỗi:", err);
        return res.status(500).json({message: "Lỗi server"});
    }
};

// ==== LOGOUT ====
exports.logout = async function (req, res) {
    // Xoá cookie refresh token
    try {
        // Clear the cookie
        res.clearCookie("refreshToken", {
            httpOnly: true, // chỉ client không thể truy cập
            secure: process.env.NODE_ENV === "production", // chỉ gửi cookie qua HTTPS trong production
            sameSite: "strict", // ngăn chặn CSRF
        });
        return res.json({message: "Đã logout"});
    } catch (err) {
        console.error("/api/admin/logout lỗi:", err);
        return res.status(500).json({message: "Lỗi server"});
    }
};

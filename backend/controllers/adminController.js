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
 *  - Sinh JWT (1h) với payload {id, email, role}
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

        // Bước 4: Kiểm tra vai trò và sinh JWT
        if (user.role !== "admin" && user.role !== "staff") {
            return res.status(403).json({message: "Forbidden"});
        }
        const payload = {id: user.id, email: user.email, role: user.role};
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1h"});

        return res.json({
            token,
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

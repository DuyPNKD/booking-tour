// Import thư viện JWT để xử lý mã hóa/giải mã token
const jwt = require("jsonwebtoken");

// Load biến môi trường từ file .env (để lấy JWT_SECRET)
require("dotenv").config();

// Middleware xác thực người dùng
function authMiddleware(req, res, next) {
    // Lấy token từ header Authorization (dạng: "Bearer <token>")
    const token = req.headers.authorization?.split(" ")[1]; // lấy token

    // Nếu không có token thì trả về lỗi 401 - chưa đăng nhập
    if (!token) return res.status(401).json({error: "Không có token"});

    try {
        // Giải mã token bằng secret key để lấy thông tin người dùng
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Gắn thông tin người dùng vào req để các controller phía sau dùng
        req.user = decoded;

        // Cho phép request tiếp tục đi đến controller
        next();
    } catch (err) {
        // Nếu token không hợp lệ hoặc hết hạn → trả về lỗi 401
        return res.status(401).json({error: "Token không hợp lệ"});
    }
}

// Export middleware để dùng trong router
module.exports = authMiddleware;

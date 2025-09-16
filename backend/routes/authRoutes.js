const express = require("express");
require("dotenv").config();
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");
const {
    register,
    login,
    me,
    updateProfile,
    verify,
    resendOtp,
    forgotPassword,
    resetPassword,
    checkResetToken,
    googleLogin,
} = require("../controllers/authController");

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
router.post("/register", register);

// 📌 Đăng nhập
router.post("/login", login);

// 📌 Lấy thông tin user từ token
router.get("/me", authMiddleware, me);

// 📌 Cập nhật hồ sơ
router.put("/me", authMiddleware, updateProfile);

// 📌 Xác thực tài khoản
router.post("/verify", verify);

// 📌 Resend OTP
router.post("/resend-otp", resendOtp);
// 📌 Quên mật khẩu
router.post("/forgot-password", forgotPassword);

// 📌 Reset mật khẩu
router.post("/reset-password", resetPassword);

// 📌 Check Reset Token
router.post("/check-reset-token", checkResetToken);

router.post("/google", googleLogin);

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

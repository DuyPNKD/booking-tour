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
    refresh,
} = require("../controllers/authController");

router.get("/ping", (req, res) => {
    res.send("Auth route OK");
});

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

// 📌 Đăng nhập với Google
router.post("/google", googleLogin);

// 📌 Check Reset Token
router.post("/check-reset-token", checkResetToken);

// 📌 Refresh token
router.post("/refresh", refresh);

// API upload avatar lên Cloudinary
// router.post(
//     "/upload/avatar",
//     authMiddleware, // Kiểm tra đăng nhập, gắn req.user
//     upload.single("avatar"), // Nhận file từ key "avatar" trong FormData
//     uploadToCloudinary("avatars", {
//         transformation: [{width: 300, height: 300, crop: "fill", gravity: "face"}, {quality: "auto"}],
//     }), // Upload lên Cloudinary
//     (req, res) => {
//         // Nếu không có file gửi lên
//         if (!req.file) {
//             return res.status(400).json({success: false, message: "Không có file được upload"});
//         }

//         // Trả về URL ảnh từ Cloudinary
//         res.json({
//             success: true,
//             path: req.file.cloudinary.secure_url,
//             public_id: req.file.cloudinary.public_id,
//             width: req.file.cloudinary.width,
//             height: req.file.cloudinary.height,
//         });
//     }
// );

module.exports = router;

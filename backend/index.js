const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// ✅ Parse body JSON & form-urlencoded
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
require("dotenv").config({
    path: process.env.NODE_ENV === "production" ? path.join(__dirname, ".env.production") : path.join(__dirname, ".env.development"),
});

// =======================
// ⚙️ CORS CONFIG
// =======================
// =======================
// ⚙️ CORS CONFIG (NEW)
// =======================
const allowedOrigins = [
    "https://booking-tour-gz2k.vercel.app", // frontend Vercel
    "http://localhost:5173", // Vite dev
    "http://localhost:3000", // nếu có dùng
];

app.use(
    cors({
        origin(origin, callback) {
            // Cho phép request không có origin (Postman, server-to-server...)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.warn("🚫 CORS blocked origin:", origin);
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

// =======================
// ⚙️ KẾT NỐI DATABASE
// =======================
const db = require("./config/db");

db.query("SELECT 1")
    .then(() => console.log("✅ Kết nối MySQL thành công!"))
    .catch((err) => console.error("❌ Kết nối MySQL thất bại:", err));

// =======================
// ⚙️ ROUTES
// =======================
app.use("/navbar-menu", require("./routes/navbarRoutes"));
app.use("/api/tours", require("./routes/tourRoutes"));
app.use("/api/booking", require("./routes/bookingRoutes"));
app.use("/api/momo", require("./routes/momoRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));

// ✅ Route xử lý redirect sau thanh toán
app.get("/payment-result", (req, res) => {
    const queryString = new URLSearchParams(req.query).toString();
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/payment-result?${queryString}`);
});

// ✅ Trả về lỗi 404 cho ảnh cũ (nếu cần)
app.get("/uploads/*", (req, res) => {
    res.status(404).json({
        message: "Ảnh đã được chuyển lên Cloudinary. Vui lòng cập nhật URL mới.",
    });
});

// =======================
// ⚙️ KHỞI ĐỘNG SERVER
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại cổng ${PORT}`);
});

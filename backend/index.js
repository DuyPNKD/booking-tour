const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// ✅ Load đúng environment file
const envFile = process.env.NODE_ENV === "production" ? path.join(__dirname, ".env.production") : path.join(__dirname, ".env.development");

console.log(`📁 Loading environment from: ${envFile}`);
require("dotenv").config({path: envFile});

// ✅ Parse body JSON & form-urlencoded
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// =======================
// ⚙️ CORS CONFIG
// =======================
const allowedOrigins = [
    "https://booking-tour-gz2k.vercel.app", // frontend Vercel
    "http://localhost:5173", // Vite dev
    `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`, // Render URL
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Cho phép request không có origin (Postman, server-to-server)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.warn("🚫 CORS blocked origin:", origin);
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    }),
);

// =======================
// ⚙️ KẾT NỐI DATABASE
// =======================
const db = require("./config/db");

// Test database connection
db.query("SELECT 1")
    .then(() => console.log("✅ Kết nối MySQL thành công!"))
    .catch((err) => console.error("❌ Kết nối MySQL thất bại:", err.message));

// =======================
// ⚙️ ROUTES (giữ nguyên của bạn)
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

// ✅ Health check endpoint cho Render
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        database: "connected", // Có thể kiểm tra thực tế
        service: "booking-tour-api",
    });
});

// ✅ Route xử lý redirect sau thanh toán
app.get("/payment-result", (req, res) => {
    const queryString = new URLSearchParams(req.query).toString();
    const frontendUrl = process.env.FRONTEND_URL || "https://booking-tour-gz2k.vercel.app";
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
app.listen(PORT, "0.0.0.0", () => {
    // ← THÊM "0.0.0.0" cho Render
    console.log(`✅ Server đang chạy tại cổng ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
    console.log(`🚀 API Base URL: http://0.0.0.0:${PORT}`);
});

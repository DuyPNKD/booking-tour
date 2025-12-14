const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// ✅ Parse body JSON & form-urlencoded
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({path: path.join(__dirname, ".env.development")});
} else {
    // production (Render): dùng Environment Variables của Render
    require("dotenv").config();
}

// =======================
// ⚙️ CORS CONFIG
// =======================
const allowedOrigins = [
    "https://booking-tour-gz2k.vercel.app", // frontend Vercel
    "http://localhost:5173", // Vite dev
    "http://localhost:3000", // nếu có dùng
];

// Cấu hình CORS với đầy đủ options cho preflight và credentials
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
        credentials: true, // Cho phép gửi cookies và credentials
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Các methods được phép
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers",
        ], // Headers được phép
        exposedHeaders: ["Authorization"], // Headers frontend có thể đọc
        preflightContinue: false, // Không tiếp tục xử lý preflight, trả về ngay
        optionsSuccessStatus: 200, // Status code cho OPTIONS request thành công
    })
);

// Xử lý preflight OPTIONS requests một cách rõ ràng
app.options("*", (req, res) => {
    const origin = req.headers.origin;
    // Khi credentials: true, phải trả về origin cụ thể, không được dùng "*"
    if (!origin || allowedOrigins.includes(origin)) {
        if (origin) {
            res.header("Access-Control-Allow-Origin", origin);
        }
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Max-Age", "86400"); // Cache preflight trong 24h
        res.sendStatus(200);
    } else {
        res.sendStatus(403);
    }
});

// Middleware logging (đặt trước routes để log tất cả requests)
app.use((req, res, next) => {
    console.log("🌍 Origin:", req.headers.origin, "| Method:", req.method, "| Path:", req.path);
    next();
});

// =======================
// ⚙️ KẾT NỐI DATABASE
// =======================
const db = require("./config/db");

db.query("select now()")
    .then((r) => console.log("✅ Postgres connected:", r.rows[0]))
    .catch((err) => console.error("❌ Postgres error:", err));

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

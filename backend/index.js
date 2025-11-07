const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");

// ✅ Parse body JSON & form-urlencoded
app.use(express.json());
app.use(express.urlencoded({extended: true}));
// CORS middleware
const cors = require("cors");
// Cookie parser middleware
app.use(cookieParser());

app.use(
    cors({
        origin: "http://localhost:5173", // cho phép React app gọi
        credentials: true, // cho phép gửi kèm cookie
    })
);

const db = require("./config/db");

db.query("SELECT 1")
    .then(() => console.log("✅ Kết nối MySQL thành công!"))
    .catch((err) => console.error("❌ Kết nối MySQL thất bại:", err));

// Route chính
app.use("/navbar-menu", require("./routes/navbarRoutes"));
app.use("/api/tours", require("./routes/tourRoutes"));
app.use("/api/booking", require("./routes/bookingRoutes"));
app.use("/api/momo", require("./routes/momoRoutes"));
app.get("/payment-result", (req, res) => {
    // giữ nguyên query string và redirect sang frontend (port dev của bạn)
    const queryString = new URLSearchParams(req.query).toString();
    return res.redirect(`http://localhost:5173/payment-result?${queryString}`);
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));

/* ✅ Cho phép truy cập ảnh trong public/uploads (chỉ khi cần thiết) */
// app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
// console.log("📁 Static path:", path.join(__dirname, "public", "uploads"));

// Redirect old image URLs to Cloudinary (nếu cần)
app.get("/uploads/*", (req, res) => {
    res.status(404).json({
        message: "Ảnh đã được chuyển lên Cloudinary. Vui lòng cập nhật URL mới.",
        note: "Sử dụng migration script để cập nhật database với URL Cloudinary mới.",
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});

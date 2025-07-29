const express = require("express");
const app = express();
const path = require("path");

app.use(express.json());
app.use(require("cors")());

const db = require("./config/db");

db.query("SELECT 1")
    .then(() => console.log("✅ Kết nối MySQL thành công!"))
    .catch((err) => console.error("❌ Kết nối MySQL thất bại:", err));

// Route chính
app.use("/navbar-menu", require("./routes/navbarRoutes"));
app.use("/api/tours", require("./routes/tourRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
/* ✅ Cho phép truy cập ảnh trong public/uploads */
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
console.log("📁 Static path:", path.join(__dirname, "public", "uploads"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});

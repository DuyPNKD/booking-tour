const express = require("express");
const app = express();

app.use(express.json());
app.use(require("cors")());

const db = require("./config/db");

db.query("SELECT 1")
    .then(() => console.log("✅ Kết nối MySQL thành công!"))
    .catch((err) => console.error("❌ Kết nối MySQL thất bại:", err));

// Route chính
app.use("/api/tours", require("./routes/tourRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});

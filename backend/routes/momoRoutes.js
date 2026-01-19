const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const momoConfig = require("../config/momoConfig");
const db = require("../config/db");
const {sendBookingConfirmationEmail} = require("../utils/mailer");

const router = express.Router();

// ✅ Tạo đơn hàng MoMo
router.post("/create", async (req, res) => {
    console.log(">>> /api/momo/create raw body:", req.body);
    const {amount, booking_id} = req.body;
    console.log("Creating MoMo order with amount:", amount, "and booking_id:", booking_id);
    console.log("Using redirectUrl:", momoConfig.redirectUrl);
    console.log("Using ipnUrl:", momoConfig.ipnUrl);

    const orderId = momoConfig.partnerCode + Date.now();
    const requestId = orderId;

    const rawSignature =
        "accessKey=" +
        momoConfig.accessKey +
        "&amount=" +
        amount +
        "&extraData=" +
        momoConfig.extraData +
        "&ipnUrl=" +
        momoConfig.ipnUrl +
        "&orderId=" +
        orderId +
        "&orderInfo=" +
        momoConfig.orderInfo +
        "&partnerCode=" +
        momoConfig.partnerCode +
        "&redirectUrl=" +
        momoConfig.redirectUrl +
        "&requestId=" +
        requestId +
        "&requestType=" +
        momoConfig.requestType;

    const signature = crypto.createHmac("sha256", momoConfig.secretKey).update(rawSignature).digest("hex");

    const requestBody = {
        partnerCode: momoConfig.partnerCode,
        partnerName: "Test",
        storeId: "MomoTestStore",
        requestId,
        amount,
        orderId,
        orderInfo: momoConfig.orderInfo,
        redirectUrl: momoConfig.redirectUrl,
        ipnUrl: momoConfig.ipnUrl,
        lang: momoConfig.lang,
        requestType: momoConfig.requestType,
        autoCapture: momoConfig.autoCapture,
        extraData: momoConfig.extraData,
        signature,
    };

    try {
        console.log("Before call MoMo API");
        const result = await axios.post("https://test-payment.momo.vn/v2/gateway/api/create", requestBody, {
            headers: {"Content-Type": "application/json"},
            timeout: 10000 /* 10 seconds */,
        });
        console.log("After call MoMo API");

        // ✅ Lưu trạng thái 'pending' cho payment
        await db.query("INSERT INTO payments (booking_id, order_id, amount, payment_method, status) VALUES (?, ?, ?, ?, 'pending')", [
            booking_id,
            orderId,
            amount,
            "momo",
        ]);

        return res.json(result.data);
    } catch (error) {
        console.error("MoMo create order error:", error);
        return res.status(500).json({error: error.message});
    }
});

// ✅ IPN Callback từ MoMo
router.post("/callback", async (req, res) => {
    console.log("📥 MoMo IPN received:", req.body);
    const {orderId, resultCode} = req.body;

    // Phản hồi ngay để tránh MoMo timeout
    res.status(200).send("OK");

    try {
        // Lấy booking_id từ orderId
        const [rows] = await db.query("SELECT booking_id FROM payments WHERE order_id = ?", [orderId]);
        if (rows.length === 0) {
            console.warn(`⚠️ Không tìm thấy payment với orderId ${orderId}`);
            return;
        }

        const bookingId = rows[0].booking_id;

        if (resultCode === 0) {
            // ✅ Thanh toán thành công
            await db.query("UPDATE payments SET status = 'paid', paid_at = NOW() WHERE order_id = ?", [orderId]);
            await db.query("UPDATE bookings SET status = 'confirmed' WHERE id = ?", [bookingId]);

            // 🔹 Lấy thông tin khách và tour từ DB để gửi email (đúng cột theo schema hiện tại)
            const [bookingRows] = await db.query(
                `SELECT 
                    COALESCE(u.name, '') AS customer_name,
                    COALESCE(u.email, '') AS customer_email,
                    t.title AS tour_name,
                    b.departure_date AS tour_date,
                    b.total_price AS amount
                FROM bookings b
                JOIN tours t ON b.tour_id = t.id
                LEFT JOIN users u ON b.user_id = u.id
                WHERE b.id = ?`,
                [bookingId],
            );

            if (bookingRows.length > 0) {
                const {customer_name, customer_email, tour_name, tour_date, amount} = bookingRows[0];
                try {
                    await sendBookingConfirmationEmail(customer_email, customer_name, orderId, tour_name, tour_date, amount);
                    console.log(`📧 Email xác nhận đã gửi tới ${customer_email}`);
                } catch (emailErr) {
                    console.error("❌ Gửi email xác nhận thất bại:", emailErr);
                }
            }
            console.log(`✅ Thanh toán thành công cho orderId ${orderId}`);
        } else {
            // ❌ Thanh toán thất bại
            await db.query("UPDATE payments SET status = 'failed' WHERE order_id = ?", [orderId]);
            await db.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [bookingId]);
            console.log(`❌ Thanh toán thất bại cho orderId ${orderId}`);
        }
    } catch (err) {
        console.error("❌ Lỗi xử lý callback MoMo:", err);
    }
});

// GET /api/momo/status?orderId=...
router.get("/status", async (req, res) => {
    const {orderId} = req.query;
    if (!orderId) return res.status(400).json({error: "Missing orderId"});
    const rows = await db.query("SELECT status, paid_at FROM payments WHERE order_id = ? LIMIT 1", [orderId]);
    return res.json({data: rows[0] || null});
});

module.exports = router;

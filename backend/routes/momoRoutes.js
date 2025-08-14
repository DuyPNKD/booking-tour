const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const momoConfig = require("../config/momoConfig");
const db = require("../config/db");

const router = express.Router();

// ✅ Tạo đơn hàng MoMo
router.post("/create", async (req, res) => {
    console.log(">>> /api/momo/create raw body:", req.body);
    const {amount, booking_id} = req.body;
    console.log("Creating MoMo order with amount:", amount, "and booking_id:", booking_id);

    const orderId = momoConfig.partnerCode + Date.now();
    const requestId = orderId;

    const rawSignature = "accessKey=" + momoConfig.accessKey + "&amount=" + amount + "&extraData=" + momoConfig.extraData + "&ipnUrl=" + momoConfig.ipnUrl + "&orderId=" + orderId + "&orderInfo=" + momoConfig.orderInfo + "&partnerCode=" + momoConfig.partnerCode + "&redirectUrl=" + momoConfig.redirectUrl + "&requestId=" + requestId + "&requestType=" + momoConfig.requestType;

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
        const result = await axios.post("https://test-payment.momo.vn/v2/gateway/api/create", requestBody, {headers: {"Content-Type": "application/json"}, timeout: 10000 /* 10 seconds */});
        console.log("After call MoMo API");

        // ✅ Lưu payment với order_id
        await db.query("INSERT INTO payments (booking_id, order_id, amount, payment_method, status) VALUES (?, ?, ?, ?, 'unpaid')", [booking_id, orderId, amount, "momo"]);

        return res.json(result.data);
    } catch (error) {
        console.error("MoMo create order error:", error);
        return res.status(500).json({error: error.message});
    }
});

// ✅ IPN Callback từ MoMo
router.post("/callback", async (req, res) => {
    const {orderId, resultCode} = req.body;

    try {
        if (resultCode === 0) {
            await db.query("UPDATE payments SET status = 'paid', paid_at = NOW() WHERE order_id = ?", [orderId]);
            console.log(`✅ Thanh toán thành công cho orderId ${orderId}`);
        } else {
            await db.query("UPDATE payments SET status = 'failed' WHERE order_id = ?", [orderId]);
            console.log(`❌ Thanh toán thất bại cho orderId ${orderId}`);
        }
    } catch (err) {
        console.error("❌ Lỗi update DB:", err);
    }

    res.status(204).send();
});

// GET /api/momo/status?orderId=...
router.get("/status", async (req, res) => {
    const {orderId} = req.query;
    if (!orderId) return res.status(400).json({error: "Missing orderId"});
    const rows = await db.query("SELECT status, paid_at FROM payments WHERE order_id = ? LIMIT 1", [orderId]);
    return res.json({data: rows[0] || null});
});

module.exports = router;

module.exports = router;

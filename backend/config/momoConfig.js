require("dotenv").config();

module.exports = {
    accessKey: process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85",
    secretKey: process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz",
    partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO",
    orderInfo: process.env.MOMO_ORDER_INFO || "Thanh toán đặt tour",
    redirectUrl: process.env.MOMO_REDIRECT_URL || "http://localhost:3000/payment-result",
    ipnUrl: process.env.MOMO_IPN_URL || "http://localhost:3000/api/momo/callback", // cần public URL (vd ngrok) khi test thật với MoMo
    requestType: process.env.MOMO_REQUEST_TYPE || "payWithMethod",
    extraData: process.env.MOMO_EXTRA_DATA || "",
    autoCapture: process.env.MOMO_AUTO_CAPTURE ? process.env.MOMO_AUTO_CAPTURE === "true" : true,
    lang: process.env.MOMO_LANG || "vi",
};

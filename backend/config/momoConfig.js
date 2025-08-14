module.exports = {
    accessKey: "F8BBA842ECF85",
    secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
    partnerCode: "MOMO",
    orderInfo: "Thanh toán đặt tour",
    redirectUrl: "http://localhost:3000/payment-result", // trang thành công
    ipnUrl: "https://f9b82bd4575d.ngrok-free.app/api/momo/callback", // IPN URL (dùng ngrok khi test)
    requestType: "payWithMethod",
    extraData: "",
    autoCapture: true,
    lang: "vi",
};

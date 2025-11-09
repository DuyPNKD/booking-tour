import {useEffect, useState} from "react";
import "./PaymentResultPage.css";

export default function PaymentResult() {
    const [status, setStatus] = useState("loading"); // loading | success | failed
    const [orderInfo, setOrderInfo] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get("orderId");
        const resultCode = params.get("resultCode");
        const amount = params.get("amount");

        // Simulate order info for demo
        setOrderInfo({
            orderId: orderId || "ORDER_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
            amount: amount || "299000",
            timestamp: new Date().toLocaleString("vi-VN"),
        });

        // nếu có orderId, gọi backend để lấy status thực tế (IPN sẽ cập nhật DB)
        if (orderId) {
            const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
            fetch(`${API_BASE}/api/momo/status?orderId=${orderId}`)
                .then((r) => r.json())
                .then((j) => {
                    const s = j.data?.status;
                    if (s === "paid") setStatus("success");
                    else if (s === "failed") setStatus("failed");
                    else {
                        // DB chưa cập nhật IPN — fallback dựa vào resultCode (tạm)
                        if (String(resultCode) === "0") setStatus("success");
                        else setStatus("failed");
                    }
                })
                .catch((e) => {
                    console.error("Error checking status:", e);
                    // fallback
                    setStatus(String(resultCode) === "0" ? "success" : "failed");
                })
                .finally(() => {
                    // gọn URL: xóa query params
                    window.history.replaceState({}, document.title, "/payment-result");
                });
        } else {
            setStatus(String(resultCode) === "0" ? "success" : "failed");
            window.history.replaceState({}, document.title, "/payment-result");
        }
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    if (status === "loading") {
        return (
            <div className="payment-result-root">
                <div className="payment-result-card loading-card">
                    <div className="payment-result-icon loading">
                        <div className="loading-spinner"></div>
                    </div>
                    <h2 className="payment-result-loading-title">Đang xử lý thanh toán</h2>
                    <p className="payment-result-loading-desc">Vui lòng chờ trong giây lát...</p>
                    <div className="loading-dots">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-result-root">
            <div className="payment-result-card">
                <div className={`payment-result-icon ${status}`}>
                    {status === "success" ? <div className="icon-success">✓</div> : <div className="icon-failed">✕</div>}
                </div>

                <h1 className={`payment-result-title ${status}`}>{status === "success" ? "Thanh toán thành công!" : "Thanh toán thất bại!"}</h1>

                <p className="payment-result-desc">
                    {status === "success"
                        ? "Giao dịch đã được xử lý thành công. Cảm ơn bạn đã sử dụng dịch vụ!"
                        : "Giao dịch không thể hoàn tất. Vui lòng thử lại hoặc liên hệ hỗ trợ."}
                </p>

                {orderInfo && (
                    <div className="order-info-card">
                        <h3 className="order-info-title">Thông tin giao dịch</h3>
                        <div className="order-info-item">
                            <span className="order-info-label">Mã đơn hàng:</span>
                            <span className="order-info-value">{orderInfo.orderId}</span>
                        </div>
                        <div className="order-info-item">
                            <span className="order-info-label">Số tiền:</span>
                            <span className="order-info-value amount">{formatCurrency(orderInfo.amount)}</span>
                        </div>
                        <div className="order-info-item">
                            <span className="order-info-label">Thời gian:</span>
                            <span className="order-info-value">{orderInfo.timestamp}</span>
                        </div>
                    </div>
                )}

                <div className="action-buttons">
                    {status === "failed" && (
                        <button onClick={() => window.location.reload()} className="btn btn-retry">
                            🔄 Thử lại
                        </button>
                    )}
                    <button onClick={() => (window.location.href = "/")} className={`btn ${status === "success" ? "btn-primary" : "btn-secondary"}`}>
                        🏠 Về trang chủ
                    </button>
                </div>

                <div className="payment-result-footer">
                    <p>
                        Nếu có thắc mắc, vui lòng liên hệ{" "}
                        <a href="#" className="support-link">
                            hỗ trợ khách hàng
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

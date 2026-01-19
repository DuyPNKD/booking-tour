import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom"; // THÊM DÒNG NÀY
import "./PaymentResultPage.css";

export default function PaymentResult() {
    const location = useLocation(); // SỬA: dùng useLocation
    const [status, setStatus] = useState("loading");
    const [orderInfo, setOrderInfo] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        // Lấy query params từ URL
        const searchParams = new URLSearchParams(location.search);
        const orderId = searchParams.get("orderId");
        const resultCode = searchParams.get("resultCode");
        const amount = searchParams.get("amount");
        const partnerCode = searchParams.get("partnerCode");
        const message = searchParams.get("message");

        console.log("💰 Payment Result - URL Params:", {
            orderId,
            resultCode,
            amount,
            partnerCode,
            message,
            fullUrl: window.location.href,
        });

        // Set thông tin đơn hàng
        setOrderInfo({
            orderId: orderId || "N/A",
            amount: amount ? parseInt(amount) : 0,
            message: message || "",
            timestamp: new Date().toLocaleString("vi-VN"),
        });

        // Xác định trạng thái
        const checkPaymentStatus = async () => {
            if (orderId) {
                try {
                    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
                    console.log(`📡 Checking payment status for orderId: ${orderId}`);

                    const response = await fetch(`${API_BASE}/api/momo/status?orderId=${orderId}`);
                    const data = await response.json();

                    console.log("Payment status API response:", data);

                    if (data.data?.status === "paid") {
                        setStatus("success");
                        setMessage("Thanh toán đã được xác nhận.");
                    } else if (data.data?.status === "failed") {
                        setStatus("failed");
                        setMessage("Thanh toán thất bại.");
                    } else {
                        // Fallback dựa vào resultCode từ MoMo
                        if (resultCode === "0") {
                            setStatus("success");
                            setMessage("Thanh toán thành công! Đang cập nhật thông tin...");
                        } else {
                            setStatus("failed");
                            setMessage(message || "Thanh toán không thành công.");
                        }
                    }
                } catch (error) {
                    console.error("❌ Lỗi khi kiểm tra trạng thái:", error);
                    // Fallback
                    if (resultCode === "0") {
                        setStatus("success");
                        setMessage("Thanh toán thành công!");
                    } else {
                        setStatus("failed");
                        setMessage(message || "Có lỗi xảy ra khi xử lý thanh toán.");
                    }
                }
            } else {
                // Không có orderId, dựa vào resultCode
                if (resultCode === "0") {
                    setStatus("success");
                    setMessage("Thanh toán thành công!");
                } else {
                    setStatus("failed");
                    setMessage(message || "Thanh toán thất bại.");
                }
            }
        };

        checkPaymentStatus();

        // Clean URL sau khi xử lý (tùy chọn)
        // window.history.replaceState({}, document.title, "/payment-result");
    }, [location.search]); // QUAN TRỌNG: dependency là location.search

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

                <p className="payment-result-desc">{message}</p>

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
                        {orderInfo.message && (
                            <div className="order-info-item">
                                <span className="order-info-label">Thông báo:</span>
                                <span className="order-info-value">{orderInfo.message}</span>
                            </div>
                        )}
                        <div className="order-info-item">
                            <span className="order-info-label">Thời gian:</span>
                            <span className="order-info-value">{orderInfo.timestamp}</span>
                        </div>
                    </div>
                )}

                <div className="action-buttons">
                    {status === "failed" && (
                        <button onClick={() => window.history.back()} className="btn btn-retry">
                            🔄 Thử lại thanh toán
                        </button>
                    )}
                    <button onClick={() => (window.location.href = "/")} className={`btn ${status === "success" ? "btn-primary" : "btn-secondary"}`}>
                        🏠 Về trang chủ
                    </button>
                    {status === "success" && (
                        <button onClick={() => (window.location.href = "/dashboard/trips")} className="btn btn-secondary">
                            📋 Xem đơn hàng
                        </button>
                    )}
                </div>

                <div className="payment-result-footer">
                    <p>
                        Nếu có thắc mắc, vui lòng liên hệ{" "}
                        <a href="/contact" className="support-link">
                            hỗ trợ khách hàng
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

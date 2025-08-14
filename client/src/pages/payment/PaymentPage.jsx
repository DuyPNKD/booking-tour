import React, {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import "./PaymentPage.css";
import axios from "axios";

const paymentMethods = [
    {key: "momo", label: "Ví Momo", icon: "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"},
    {key: "zalopay", label: "Ví ZaloPay", icon: "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png"},
    {key: "vnpay", label: "VNPAY: Thẻ ATM - Tài khoản ngân hàng", icon: "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR.png"},
];

const PaymentPage = () => {
    const {id: bookingId} = useParams();

    const [bookingData, setBookingData] = useState(null);
    const [selected, setSelected] = useState(paymentMethods[0].key);
    const [showPriceDetail, setShowPriceDetail] = useState(true);

    useEffect(() => {
        console.log("Booking ID:", bookingId);

        const fetchBooking = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/booking/${bookingId}`);
                // console.log("Booking response:", res.data);
                if (res.data.success) {
                    const {booking, details} = res.data;

                    // Tính tổng số khách theo loại từ details
                    const guests = {adult: 0, child: 0, infant: 0};
                    details.forEach((d) => {
                        guests[d.target_type] = d.quantity;
                    });

                    // Tính giá từng loại dựa trên tour (giá tour bạn trả về trong API)
                    const adultTotal = guests.adult * booking.price_adult;
                    const childTotal = guests.child * booking.price_child;
                    const infantTotal = guests.infant * booking.price_infant;

                    const bookingObj = {
                        ...booking,
                        guests,
                        adultTotal,
                        childTotal,
                        infantTotal,
                        totalPrice: booking.total_price,
                    };
                    console.log("Booking object:", bookingObj);

                    setBookingData(bookingObj);
                }
            } catch (error) {
                console.error("Lỗi khi lấy booking:", error);
            }
        };

        if (bookingId) {
            fetchBooking();
        }
    }, [bookingId]);

    const handlePayment = async () => {
        if (!bookingData) return;

        try {
            const res = await axios.post("http://localhost:3000/api/momo/create", {
                booking_id: bookingId,
                amount: bookingData.totalPrice,
            });

            if (res.data?.payUrl) {
                window.location.href = res.data.payUrl;
            } else {
                alert("Không tạo được đơn hàng thanh toán.");
            }
        } catch (error) {
            alert("Lỗi khi tạo đơn hàng thanh toán.");
        }
    };

    if (!bookingData) {
        return <div>Đang tải thông tin đặt chỗ...</div>;
    }
    console.log("Booking data:", bookingData);

    const {guests, adultTotal, childTotal, tour_name, departure_date, address, full_name, phone_number, email, location_name, num_day, num_night} = bookingData;
    console.log("Guests data:", guests);
    const adults = guests.adult || 0;
    const infants = guests.infant || 0;
    const children = guests.child || 0;

    return (
        <div className="payment-page">
            <div className="payment-page-container">
                <h2 className="payment-title">Bạn muốn thanh toán thế nào?</h2>
                <div className="payment-main">
                    <div className="payment-left">
                        <div className="payment-methods">
                            {paymentMethods.map((m) => (
                                <button key={m.key} className={`payment-method-btn${selected === m.key ? " selected" : ""}`} onClick={() => setSelected(m.key)}>
                                    <img src={m.icon} alt={m.label} className="payment-method-icon" />
                                    <span>{m.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="payment-total-box">
                            <div className={`payment-total-row${showPriceDetail ? " payment-total-row--active" : ""}`}>
                                <span>Tổng giá tiền</span>
                                <span className="payment-total-amount-wrapper">
                                    <span className="payment-total-amount">{bookingData.totalPrice.toLocaleString("vi-VN")} VND</span>
                                    <button className="price-toggle-btn" onClick={() => setShowPriceDetail((prev) => !prev)} aria-label={showPriceDetail ? "Ẩn chi tiết" : "Xem chi tiết"}>
                                        {showPriceDetail ? <i className="fa-solid fa-chevron-up" style={{color: "#007aff", fontSize: 18}}></i> : <i className="fa-solid fa-chevron-down" style={{color: "#007aff", fontSize: 12}}></i>}
                                    </button>
                                </span>
                            </div>
                            {showPriceDetail && (
                                <div className={`payment-total-detail${showPriceDetail ? " show" : ""}`}>
                                    <div className="payment-total-detail-row">
                                        <span>Người lớn ({adults}x)</span>
                                        <span>{adultTotal.toLocaleString()} VND</span>
                                    </div>
                                    {children > 0 && (
                                        <div className="payment-total-detail-row">
                                            <span>Trẻ em ({children}x)</span>
                                            <span>{childTotal.toLocaleString()} VND</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            <button className="payment-submit-btn" onClick={handlePayment}>
                                Thanh toán
                            </button>
                            <div className="payment-note">
                                Bằng cách tiếp tục thanh toán, bạn đã đồng ý <a href="#">Điều khoản & Điều kiện</a> và <a href="#">Chính sách quyền riêng tư</a>.
                            </div>
                        </div>
                    </div>
                    <div className="payment-right">
                        <div className="payment-summary-box">
                            <div className="payment-summary-header">
                                <div className="payment-summary-header-left">
                                    <div className="payment-summary-icon-wrapper">
                                        <i className="fa-solid fa-utensils payment-summary-icon"></i>
                                    </div>
                                </div>
                                <div className="payment-summary-header-right">
                                    <span className="payment-summary-header-title">Tóm tắt Xperience</span>
                                    <span className="payment-summary-code">
                                        Mã đặt chỗ
                                        <span className="payment-summary-code-value">{bookingId}</span>
                                    </span>
                                </div>
                            </div>
                            <div className="payment-summary-section">
                                <div className="payment-summary-section-title">CHI TIẾT ĐẶT CHỖ</div>
                                <div className="payment-summary-row">
                                    <div className="payment-summary-tour">{tour_name}</div>
                                </div>
                                <div className="payment-summary-row">
                                    <span>Ngày tham quan</span>
                                    <span>{new Date(departure_date).toLocaleDateString("vi-VN", {weekday: "long", year: "numeric", month: "numeric", day: "numeric"})}</span>
                                </div>
                                <div className="payment-summary-row">
                                    <span>Địa điểm</span>
                                    <span>{location_name}</span>
                                </div>
                                <div className="payment-summary-row">
                                    <span>Thời gian</span>
                                    <span>
                                        {num_day} ngày {num_night} đêm
                                    </span>
                                </div>
                                <div className="payment-summary-row">
                                    <span>Áp dụng cho</span>
                                    <span>
                                        Người lớn: {adults}, Trẻ em: {children}, Em bé: {infants}
                                    </span>
                                </div>
                                {/* Thêm các trường khác bạn muốn hiển thị */}
                            </div>
                            <div className="payment-summary-separate"></div>
                            <div className="payment-summary-section">
                                <div className="payment-summary-section-title">KHÁCH</div>
                                <div className="payment-summary-row-1">{full_name}</div>
                                <div className="payment-summary-row-1">{phone_number}</div>
                                <div className="payment-summary-row-1">{email}</div>
                                <div className="payment-summary-row-1">{address}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;

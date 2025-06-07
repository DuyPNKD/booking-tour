import React, {useState} from "react";
import "./BookingPage.css";
import ninhThuan from "../../assets/ninh_thuan.webp";

const BookingPage = () => {
    const [gender, setGender] = useState("male");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [note, setNote] = useState("");
    const [invoice, setInvoice] = useState(false);
    const [departureDate, setDepartureDate] = useState("2025-06-07");
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [babies, setBabies] = useState(0);

    return (
        <div className="booking-bg">
            <div className="booking-container">
                {/* Left: Form */}
                <div className="booking-form">
                    <h2 className="booking-form-title">Thông tin khách hàng</h2>

                    <div className="booking-form-group">
                        <label>
                            Họ và tên <span className="booking-required">*</span>
                        </label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập họ và tên" className="booking-input" />
                    </div>
                    <div className="booking-form-group">
                        <label>
                            Số điện thoại <span className="booking-required">*</span>
                        </label>
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Nhập số điện thoại" className="booking-input" />
                    </div>
                    <div className="booking-form-group">
                        <label>
                            Email <span className="booking-required">*</span>
                        </label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Nhập email" className="booking-input" />
                    </div>
                    <div className="booking-form-group">
                        <label>Ghi chú đặc biệt (nếu có)</label>
                        <textarea value={note} onChange={(e) => setNote(e.target.value)} className="booking-textarea" />
                    </div>
                </div>
                {/* Right: Room Info */}
                <div className="booking-room-info">
                    {/* Lấy dữ liệu từ trang detail (giả lập) */}
                    <img src={ninhThuan} alt="Tour Ninh Thuận" className="booking-room-img" />
                    <div className="booking-room-tour-title custom-room-title">Tour Ninh Thuận – Vĩnh Hy 3 ngày 2 đêm từ TP.HCM</div>
                    <div className="booking-room-info-group">
                        <div className="booking-room-info-row">
                            <span className="booking-room-info-icon">
                                <i className="fa-regular fa-clock tour-price-icon"></i>
                            </span>
                            <span>Thời gian: 3 ngày 2 đêm</span>
                        </div>
                        <div className="booking-room-info-row">
                            <span className="booking-room-info-icon">
                                <i className="fa-solid fa-location-dot tour-price-icon"></i>
                            </span>
                            <span>Điểm khởi hành: Hồ Chí Minh</span>
                        </div>
                    </div>
                    <div className="booking-room-label">Ngày khởi hành</div>
                    <div className="booking-room-date-input-wrap">
                        <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="booking-room-date-input" />
                    </div>
                    <div className="booking-room-people-group">
                        <div className="booking-room-people-col">
                            <div className="booking-room-people-label">Người lớn</div>
                            <div className="booking-room-people-value">
                                <input type="number" min={1} value={adults} onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))} className="people-input-number" />
                            </div>
                        </div>
                        <div className="booking-room-people-col">
                            <div className="booking-room-people-label">
                                Trẻ em <span className="booking-room-people-age">(2-12)</span>
                            </div>
                            <div className="booking-room-people-value">
                                <input type="number" min={0} value={children} onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))} className="people-input-number" />
                            </div>
                        </div>
                        <div className="booking-room-people-col">
                            <div className="booking-room-people-label">
                                Em bé <span className="booking-room-people-age">(0-2)</span>
                            </div>
                            <div className="booking-room-people-value">
                                <input type="number" min={0} value={babies} onChange={(e) => setBabies(Math.max(0, Number(e.target.value)))} className="people-input-number" />
                            </div>
                        </div>
                    </div>
                    <div style={{textAlign: "left", position: "relative"}}>
                        <a href="#" className="booking-room-link booking-room-link-custom cancel-tooltip-trigger" tabIndex={0}>
                            Xem điều kiện hoàn huỷ
                        </a>
                        <div className="cancel-tooltip">
                            Không hoàn huỷ hoặc thay đổi
                            <span className="cancel-tooltip-arrow"></span>
                        </div>
                    </div>

                    <div className="booking-room-price-row booking-room-price-row-custom">
                        <span>Giá tour</span>
                        <span>2.622.000</span>
                    </div>
                    <hr className="booking-room-hr" />
                    <div className="booking-room-total-row booking-room-total-row-custom">
                        <span>Tổng tiền</span>
                        <span className="booking-room-total-amount">
                            2.622.000 <span className="booking-room-total-currency">đ</span>
                        </span>
                    </div>
                    <button className="booking-submit-btn booking-submit-btn-custom">Thanh toán</button>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;

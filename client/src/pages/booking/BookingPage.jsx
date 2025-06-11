import React, {useState} from "react";
import "./BookingPage.css";
import ninhThuan from "../../assets/ninh_thuan.webp";
import {useLocation, useParams} from "react-router-dom";

const BookingPage = () => {
    const [gender, setGender] = useState("male");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [note, setNote] = useState("");
    const [invoice, setInvoice] = useState(false);

    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [babies, setBabies] = useState(0);

    const {id} = useParams();
    const location = useLocation();

    const {title, image, duration, departurePlace, price, rating, ratingCount, departureDate, guestCounts} = location.state || {};

    const [departureDateState, setDepartureDateState] = useState(departureDate || "");
    const [guestCountState, setGuestCountState] = useState(
        guestCounts || {
            adult: 1,
            child58: 0,
            child24: 0,
            infant: 0,
        }
    );

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
                        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ví dụ: Đi 2 người lớn, đoàn 10 người..." className="booking-textarea" />
                    </div>
                </div>
                {/* Right: Room Info */}
                <div className="booking-room-info">
                    <div className="booking-room-tour-title custom-room-title">{title}</div>
                    <img src={image} alt={title} className="booking-room-img" />
                    <div className="booking-room-info-group">
                        <div className="booking-room-info-row">
                            <span className="booking-room-info-icon">
                                <i className="fa-regular fa-clock tour-price-icon"></i>
                            </span>
                            <span>Thời gian: {duration}</span>
                        </div>
                        <div className="booking-room-info-row">
                            <span className="booking-room-info-icon">
                                <i className="fa-solid fa-location-dot tour-price-icon"></i>
                            </span>
                            <span>Điểm khởi hành: {departurePlace}</span>
                        </div>
                        <div className="booking-room-info-row">
                            <span className="booking-room-info-icon">
                                <i class="fa-regular fa-calendar tour-price-icon"></i>
                            </span>
                            <span>Ngày khởi hành: {departureDate}</span>
                        </div>
                    </div>
                    <div className="booking-room-people-confirm">
                        <div className="booking-room-people-row">
                            <span>Người lớn({">"}8 tuổi):</span>
                            <span>
                                {guestCounts.adult} x {price.toLocaleString("vi-VN")} đ
                            </span>
                        </div>
                        <div className="booking-room-people-row">
                            <span>Trẻ em (5-8):</span>
                            <span>
                                {guestCounts.child58} x {price.toLocaleString("vi-VN")} đ
                            </span>
                        </div>
                        <div className="booking-room-people-row">
                            <span>Trẻ em (2-4):</span>
                            <span>
                                {guestCounts.child24} x {price.toLocaleString("vi-VN")} đ
                            </span>
                        </div>
                        <div className="booking-room-people-row">
                            <span>Trẻ nhỏ (0-2):</span>
                            <span>{guestCounts.infant} x 0 đ</span>
                        </div>
                    </div>
                    {/* <div style={{textAlign: "left", position: "relative"}}>
                        <a href="#" className="booking-room-link booking-room-link-custom cancel-tooltip-trigger" tabIndex={0}>
                            Xem điều kiện hoàn huỷ
                        </a>
                        <div className="cancel-tooltip">
                            Không hoàn huỷ hoặc thay đổi
                            <span className="cancel-tooltip-arrow"></span>
                        </div>
                    </div> */}
                    <div className="booking-room-price-row booking-room-price-row-custom">
                        <span>Giá tour</span>
                        <span>{price?.toLocaleString()} đ</span>
                    </div>
                    <hr className="booking-room-hr" />
                    <div className="booking-room-total-row booking-room-total-row-custom">
                        <span>Tổng tiền</span>

                        <span className="booking-room-total-amount">{price?.toLocaleString()} đ</span>
                    </div>
                    <button className="booking-submit-btn booking-submit-btn-custom">Thanh toán</button>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;

import React, {useState, useEffect} from "react";
import "./BookingPage.css";
import ninhThuan from "../../assets/ninh_thuan.webp";
import {useSearchParams, useParams} from "react-router-dom";
import axios from "axios";

const BookingPage = () => {
    const {id} = useParams();
    const [searchParams] = useSearchParams();

    const [gender, setGender] = useState("male");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [note, setNote] = useState("");
    const [invoice, setInvoice] = useState(false);
    const [tour, setTour] = useState(null);

    console.log("Tour ID:", id);
    useEffect(() => {
        const fetchTour = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/tours/${id}`);
                console.log("Tour data fetched:", res.data);
                setTour(res.data || {});
            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
            }
        };
        fetchTour();
    }, [id]);

    console.log("Tour data:", tour);
    const departureDate = searchParams.get("date") || "";
    const guestCounts = {
        adult: parseInt(searchParams.get("adult") || "1"),
        child58: parseInt(searchParams.get("child58") || "0"),
        child24: parseInt(searchParams.get("child24") || "0"),
        infant: parseInt(searchParams.get("infant") || "0"),
    };

    // // Tính tổng tiền
    const totalPrice = guestCounts.adult * tour?.price + guestCounts.child58 * tour?.price + guestCounts.child24 * tour?.price || 0;

    if (!tour) {
        return <div style={{padding: 40, fontSize: 18}}>Đang tải thông tin tour...</div>;
    }
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
                    <div className="booking-room-tour-title custom-room-title">{tour?.title}</div>
                    <img src={tour?.image} alt={tour?.title} className="booking-room-img" />
                    <div className="booking-room-info-group">
                        <div className="booking-room-info-row">
                            <span className="booking-room-info-icon">
                                <i className="fa-regular fa-clock tour-price-icon"></i>
                            </span>
                            <span>Thời gian: {tour?.duration}</span>
                        </div>
                        <div className="booking-room-info-row">
                            <span className="booking-room-info-icon">
                                <i className="fa-solid fa-location-dot tour-price-icon"></i>
                            </span>
                            <span>Điểm khởi hành: {tour?.location_name}</span>
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
                                {guestCounts.adult} x {tour?.price.toLocaleString("vi-VN")} đ
                            </span>
                        </div>
                        <div className="booking-room-people-row">
                            <span>Trẻ em (5-8):</span>
                            <span>
                                {guestCounts.child58} x {tour?.price.toLocaleString("vi-VN")} đ
                            </span>
                        </div>
                        <div className="booking-room-people-row">
                            <span>Trẻ em (2-4):</span>
                            <span>
                                {guestCounts.child24} x {tour?.price.toLocaleString("vi-VN")} đ
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
                        <span>{tour.price?.toLocaleString()} đ</span>
                    </div>
                    <hr className="booking-room-hr" />
                    <div className="booking-room-total-row booking-room-total-row-custom">
                        <span>Tổng tiền</span>

                        <span className="booking-room-total-amount">{totalPrice} đ</span>
                    </div>
                    <button className="booking-submit-btn booking-submit-btn-custom">Thanh toán</button>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;

import React, {useState, useEffect} from "react";
import "./BookingPage.css";
import ninhThuan from "../../assets/ninh_thuan.webp";
import {useSearchParams, useParams, Link, useNavigate, useLocation} from "react-router-dom";
import axios from "axios";
import {useAuth} from "../../context/AuthContext";

const BookingPage = () => {
    const {user} = useAuth();
    const {id} = useParams();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [errors, setErrors] = useState({});
    const [errorTimeouts, setErrorTimeouts] = useState({});

    const [toastMessage, setToastMessage] = useState("");
    const navigate = useNavigate();

    const [tour, setTour] = useState(null);
    const [prices, setPrices] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        gender: "",
        note: "",
    });
    const [showPriceDetail, setShowPriceDetail] = useState(true);

    useEffect(() => {
        const API_BASE = import.meta.env.VITE_API_BASE || "";
        const fetchTour = async () => {
            const res = await axios.get(`${API_BASE}/api/tours/${id}`);
            const {success, data} = res.data;
            if (success && data) {
                setTour(data);
                setPrices(data.prices || []);
                console.log("Tour data consolidated:", data);
            }
        };
        fetchTour();
    }, [id]);

    // Retrieve booking parameters from Location State, SessionStorage, or fallback Query Params
    const getInitialBookingData = () => {
        if (location.state && location.state.date !== undefined) {
            return location.state;
        }

        try {
            const stored = sessionStorage.getItem(`booking_draft_${id}`);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error("Failed to parse booking draft from sessionStorage", e);
        }

        return {
            date: searchParams.get("date") || "",
            adult: parseInt(searchParams.get("adult") || "1", 10),
            child58: parseInt(searchParams.get("child58") || "0", 10),
            child24: parseInt(searchParams.get("child24") || "0", 10),
            infant: parseInt(searchParams.get("infant") || "0", 10),
        };
    };

    const initialBookingData = getInitialBookingData();
    const departureDate = initialBookingData.date || "";
    const guestCounts = {
        adult: Number(initialBookingData.adult) || 1,
        child58: Number(initialBookingData.child58) || 0,
        child24: Number(initialBookingData.child24) || 0,
        infant: Number(initialBookingData.infant) || 0,
    };

    const getPriceByType = (type) => {
        const found = prices.find((p) => p.target_type === type);
        return found ? found.price : 0;
    };
    // // Tính tổng tiền
    const totalPrice = guestCounts.adult * getPriceByType("adult") + guestCounts.child58 * getPriceByType("child") || 0;

    // Tính giá từng loại khách
    const adultTotal = guestCounts.adult * getPriceByType("adult") || 0;
    const childTotal = (guestCounts.child58 + guestCounts.child24) * getPriceByType("child") || 0;

    // Giả lập trạng thái đăng nhập, thay bằng logic thực tế của bạn
    const isLoggedIn = false;

    const validateForm = () => {
        const newErrors = {};

        // ✅ 1. Giới tính (Danh xưng)
        if (!formData.gender?.trim()) {
            newErrors.gender = "Danh xưng là bắt buộc.";
        } else if (!["male", "female"].includes(formData.gender)) {
            newErrors.gender = "Danh xưng không hợp lệ.";
        }

        // ✅ 2. Họ và tên
        if (!formData.name?.trim()) {
            newErrors.name = "Họ tên là bắt buộc.";
        } else {
            const nameRegex = /^[A-Za-zÀ-Ỹà-ỹ\s]+$/;
            const trimmedName = formData.name.trim();
            const wordCount = trimmedName.split(/\s+/).length;

            if (!nameRegex.test(trimmedName)) {
                newErrors.name = "Họ tên chỉ được chứa chữ cái và khoảng trắng.";
            } else if (trimmedName.length < 2 || trimmedName.length > 50) {
                newErrors.name = "Họ tên phải từ 2 đến 50 ký tự.";
            } else if (wordCount < 2) {
                newErrors.name = "Vui lòng nhập đầy đủ họ và tên.";
            }
        }

        // ✅ 3. Số điện thoại
        if (!formData.phone?.trim()) {
            newErrors.phone = "Số điện thoại là bắt buộc.";
        } else {
            const phoneRegex = /^(03|05|07|08|09)[0-9]{8}$/;
            if (!phoneRegex.test(formData.phone)) {
                newErrors.phone = "Số điện thoại không hợp lệ (gồm 10 chữ số, bắt đầu bằng 03, 05, 07, 08 hoặc 09).";
            }
        }

        // ✅ 4. Email
        if (!formData.email?.trim()) {
            newErrors.email = "Email là bắt buộc.";
        } else {
            const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = "Email không hợp lệ.";
            }
        }

        // ✅ 5. Địa chỉ
        if (!formData.address?.trim()) {
            newErrors.address = "Địa chỉ là bắt buộc.";
        } else if (formData.address.trim().length < 10) {
            newErrors.address = "Vui lòng nhập địa chỉ chi tiết hơn (tối thiểu 10 ký tự).";
        }

        setErrors(newErrors);

        const hasUserInfoErrors = newErrors.name || newErrors.phone || newErrors.email || newErrors.gender;
        const hasAddressError = newErrors.address;

        if (hasUserInfoErrors) {
            showToast("Vui lòng nhập thông tin hành khách.");
            return false;
        }

        if (hasAddressError) {
            showToast("Vui lòng nhập thông tin đặt chỗ bổ sung.");
            return false;
        }

        return true;
    };

    const handleContinue = () => {
        if (validateForm()) {
            // Nếu hợp lệ → chuyển trang hoặc gọi API, v.v...
            setShowModal(true); // Hiển thị modal xác nhận
        } else {
            setToastMessage("Vui lòng điền đầy đủ thông tin!");
        }
    };

    const handleChange = (e) => {
        const {name, value} = e.target;

        // Cập nhật formData
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Nếu có lỗi ở trường đang nhập
        if (errors[name]) {
            // Nếu có timeout cũ, clear
            if (errorTimeouts[name]) {
                clearTimeout(errorTimeouts[name]);
            }

            // Tạo timeout mới
            const timeoutId = setTimeout(() => {
                setErrors((prev) => ({
                    ...prev,
                    [name]: undefined,
                }));
            }, 400);

            // Lưu timeout mới
            setErrorTimeouts((prev) => ({
                ...prev,
                [name]: timeoutId,
            }));
        }
    };

    const handleConfirm = async () => {
        setShowModal(false);

        // Sanitize & validate departure_date into valid ISO string
        let validDepartureDate = departureDate;
        if (!validDepartureDate || isNaN(new Date(validDepartureDate).getTime())) {
            // Fallback to 3 days from now
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 3);
            validDepartureDate = defaultDate.toISOString();
        } else {
            validDepartureDate = new Date(validDepartureDate).toISOString();
        }

        // Tạo payload gửi lên backend
        const payload = {
            tour_id: Number(id) || tour?.id,
            gender: formData.gender,
            full_name: formData.name,
            phone_number: formData.phone,
            email: formData.email,
            address: formData.address,
            note: formData.note,
            departure_date: validDepartureDate,
            total_price: totalPrice,
            details: [
                {target_type: "adult", quantity: Number(guestCounts.adult) || 1},
                {target_type: "child", quantity: (Number(guestCounts.child58) || 0) + (Number(guestCounts.child24) || 0)},
                {target_type: "infant", quantity: Number(guestCounts.infant) || 0},
            ].filter((item) => item.quantity > 0),
        };

        try {
            const API_BASE = import.meta.env.VITE_API_BASE || "";
            const res = await axios.post(`${API_BASE}/api/booking`, payload);
            if (res.data.success) {
                const bookingId = res.data.bookingId || res.data.booking_id;
                navigate(`/payment/${bookingId}`);
            } else {
                showToast(res.data.message || "Đặt chỗ thất bại, vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Booking submission error:", error.response?.data || error);
            const errMsg = error.response?.data?.message || "Đặt chỗ thất bại, vui lòng kiểm tra lại thông tin!";
            showToast(errMsg);
        }
    };

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage(""); // tự động ẩn sau 3 giây
        }, 5000);
    };

    const closeToast = () => {
        setToastMessage(""); // đóng thủ công
    };

    // Helper function for robust image resolution
    const getTourImageSrc = (t) => {
        if (!t) return ninhThuan;
        let url = "";
        if (t.images && Array.isArray(t.images) && t.images.length > 0) {
            const first = t.images[0];
            url = typeof first === "string" ? first : (first.image_url || first.image_path || first.url || "");
        }
        if (!url) {
            url = t.thumbnail_url || t.thumbnail || "";
        }
        if (!url) return ninhThuan;
        if (url.startsWith("/")) {
            const base = import.meta.env.VITE_API_BASE || "";
            return base + url;
        }
        return url;
    };

    if (!tour) {
        return <div style={{padding: 40, fontSize: 18}}>Đang tải thông tin tour...</div>;
    }
    return (
        <div className="booking-page">
            <div className="booking-container">
                <div className="booking-content">
                    {/* Left Form */}
                    <div className="booking-form">
                        <div className="booking-form-h1">Đặt chỗ của bạn</div>
                        <div className="booking-form-p">Điền thông tin người liên hệ bên dưới</div>
                        {!user && (
                            <div className="booking-login-alert">
                                <div className="booking-login-alert-img">
                                    <img src="https://d1785e74lyxkqq.cloudfront.net/_next/static/v4.6.0/3/334a43706b543daaa27995a60d895f2a.png" alt="login" />
                                </div>
                                <div className="booking-login-alert-content">
                                    <div className="booking-login-alert-title">Đăng nhập hoặc đăng ký để đặt chỗ dễ dàng và nhận thêm nhiều lợi ích!</div>
                                    <div className="booking-login-alert-benefits">
                                        <div>
                                            <i className="fa-regular fa-user" style={{marginRight: 6}}></i>
                                            Nhanh chóng điền thông tin với Chi tiết hành khách đã lưu
                                        </div>
                                        <div>
                                            <i className="fa-solid fa-gift" style={{marginRight: 6}}></i>
                                            Tận hưởng các ưu đãi độc quyền, kiếm Điểm DTravel và quản lý đặt chỗ dễ dàng
                                        </div>
                                    </div>
                                    <div className="booking-login-alert-action">
                                        <Link to="/auth/login?step=signin" className="booking-login-alert-link">
                                            Đăng nhập hoặc Đăng ký
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                        <h2 className="booking-form-title">Thông tin liên hệ</h2>
                        <div className="booking-form-group-details">
                            <div className="booking-form-group">
                                <label>
                                    Danh xưng <span className="booking-required">*</span>
                                </label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className={`booking-select booking-input ${errors.gender ? "input-error" : ""}`}>
                                    <option value=""></option>
                                    <option value="male">Ông</option>
                                    <option value="female">Bà</option>
                                </select>
                                {errors.gender ? <div className="input-error-text">{errors.gender}</div> : <span className="input-hint"></span>}
                            </div>
                            <div className="booking-form-group">
                                <label>
                                    Họ và tên <span className="booking-required">*</span>
                                </label>
                                <input name="name" type="text" value={formData.name} onChange={handleChange} className={`booking-input ${errors.name ? "input-error" : ""}`} />
                                {errors.name ? <div className="input-error-text">{errors.name}</div> : <span className="input-hint">VD: Nguyễn Văn A</span>}
                            </div>
                            <div className="booking-form-group-1">
                                <div className="booking-form-group-2" style={{paddingRight: 12, width: "50%"}}>
                                    <label>
                                        Số điện thoại <span className="booking-required">*</span>
                                    </label>
                                    <input name="phone" type="text" value={formData.phone} onChange={handleChange} className={`booking-input ${errors.phone ? "input-error" : ""}`} />
                                    {errors.phone ? <div className="input-error-text">{errors.phone}</div> : <span className="input-hint">VD: 0912345678</span>}
                                </div>
                                <div className="booking-form-group-2" style={{paddingLeft: 12, width: "50%"}}>
                                    <label>
                                        Email <span className="booking-required">*</span>
                                    </label>
                                    <input name="email" type="email" value={formData.email} onChange={handleChange} className={`booking-input ${errors.email ? "input-error" : ""}`} />
                                    {errors.email ? <div className="input-error-text">{errors.email}</div> : <span className="input-hint">VD: email@example.com</span>}
                                </div>
                            </div>

                            <div className="booking-form-group">
                                <label>Yêu cầu thêm (tùy chọn)</label>
                                <textarea name="note" value={formData.note} onChange={handleChange} placeholder="Yêu cầu đặc biệt" className="booking-textarea" />
                            </div>
                        </div>
                        <div className="booking-extra-info">
                            <div className="booking-extra-info-title">Thông tin thêm</div>
                            <div className="booking-extra-info-desc">
                                Vui lòng cung cấp địa chỉ để sắp xếp đón tour
                                <span className="booking-required">*</span>
                            </div>
                            <input name="address" type="text" className={`booking-input ${errors.address ? "input-error" : ""}`} placeholder="" value={formData.address} onChange={handleChange} />
                            {errors.address ? <div className="input-error-text">{errors.address}</div> : <span className="input-hint">VD: Số nhà 1, Ngách 37, Ngõ 66 An Hồng, Phường Hồng An, Hải Phòng</span>}
                        </div>
                    </div>

                    {/* Right: Redesigned Booking Summary Card */}
                    <div className="booking-room-info-card">
                        <div className="booking-summary-header">
                            <i className="fa-solid fa-receipt summary-icon"></i>
                            <h3>Tóm Tắt Đặt Chỗ</h3>
                        </div>

                        {/* Image & Title Header */}
                        <div className="booking-tour-media">
                            <img
                                src={getTourImageSrc(tour)}
                                alt={tour?.title || "Tour image"}
                                className="booking-tour-thumb"
                                onError={(e) => {
                                    e.target.src = ninhThuan;
                                }}
                            />
                            <div className="booking-tour-title-wrap">
                                <h4 className="booking-tour-name">{tour?.title || "Đang tải thông tin tour..."}</h4>
                                {tour?.location_name && (
                                    <span className="booking-tour-location">
                                        <i className="fa-solid fa-location-dot"></i> {tour.location_name}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Summary Details List */}
                        <div className="booking-details-box">
                            <div className="booking-detail-item">
                                <div className="detail-icon"><i className="fa-regular fa-calendar-days"></i></div>
                                <div className="detail-info">
                                    <span className="detail-label">Ngày tham quan</span>
                                    <span className="detail-value">
                                        {departureDate ? (() => {
                                            const date = new Date(departureDate);
                                            const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
                                            return `${days[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                                        })() : "Chưa chọn ngày"}
                                    </span>
                                </div>
                            </div>

                            <div className="booking-detail-item">
                                <div className="detail-icon"><i className="fa-regular fa-clock"></i></div>
                                <div className="detail-info">
                                    <span className="detail-label">Thời gian chuyến đi</span>
                                    <span className="detail-value">
                                        {tour?.num_day ? `${tour.num_day} ngày ${tour.num_night || 0} đêm` : "Theo chương trình tour"}
                                    </span>
                                </div>
                            </div>

                            <div className="booking-detail-item">
                                <div className="detail-icon"><i className="fa-solid fa-users"></i></div>
                                <div className="detail-info">
                                    <span className="detail-label">Số lượng khách</span>
                                    <span className="detail-value">
                                        {guestCounts.adult} Người lớn
                                        {guestCounts.child58 + guestCounts.child24 > 0 && `, ${guestCounts.child58 + guestCounts.child24} Trẻ em`}
                                        {guestCounts.infant > 0 && `, ${guestCounts.infant} Em bé`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Pricing Total Header */}
                        <div className="booking-price-summary-box">
                            <div className="price-summary-main">
                                <div className="price-label-wrap">
                                    <span className="price-title">Giá bạn trả</span>
                                    <span className="price-subtitle">Đã gồm thuế & phí</span>
                                </div>
                                <div className="price-amount-wrap">
                                    <span className="price-amount">{totalPrice.toLocaleString("vi-VN")} đ</span>
                                    <button
                                        className="price-detail-toggle-btn"
                                        onClick={() => setShowPriceDetail((prev) => !prev)}
                                        aria-label="Toggle price detail"
                                    >
                                        <i className={`fa-solid ${showPriceDetail ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
                                    </button>
                                </div>
                            </div>

                            {/* Detailed Price Breakdown */}
                            {showPriceDetail && (
                                <div className="price-breakdown-list">
                                    <div className="price-breakdown-item">
                                        <span>Người lớn ({guestCounts.adult}x)</span>
                                        <span>{(getPriceByType("adult") * guestCounts.adult).toLocaleString("vi-VN")} đ</span>
                                    </div>
                                    {guestCounts.child58 + guestCounts.child24 > 0 && (
                                        <div className="price-breakdown-item">
                                            <span>Trẻ em ({guestCounts.child58 + guestCounts.child24}x)</span>
                                            <span>{(getPriceByType("child") * (guestCounts.child58 + guestCounts.child24)).toLocaleString("vi-VN")} đ</span>
                                        </div>
                                    )}
                                    {guestCounts.infant > 0 && (
                                        <div className="price-breakdown-item">
                                            <span>Em bé ({guestCounts.infant}x)</span>
                                            <span>{(getPriceByType("infant") * guestCounts.infant).toLocaleString("vi-VN")} đ</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="booking-room-info-group" style={{ marginTop: 20 }}>
                            <button className="booking-submit-btn" onClick={handleContinue}>
                                Tiếp tục
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {toastMessage && (
                <div className="toast-container">
                    <div className="toast-message">
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <i className="fa-solid fa-circle-exclamation" style={{ fontSize: "1.2rem", color: "#ffffff" }}></i>
                            <span>{toastMessage}</span>
                        </div>
                        <button className="toast-close-btn" onClick={closeToast} aria-label="Đóng thông báo">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
            )}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-confirm">
                        <h3>Tất cả thông tin đặt chỗ của bạn đều đã chính xác?</h3>
                        <p>
                            Bạn sẽ không thể thay đổi thông tin đặt chỗ sau khi tiến hành thanh toán.
                            <br />
                            Bạn có muốn tiếp tục?
                        </p>
                        <div className="modal-confirm-actions">
                            <button className="btn-outline" onClick={() => setShowModal(false)}>
                                Kiểm tra lại
                            </button>
                            <button className="btn-filled" onClick={handleConfirm}>
                                Tiếp tục
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingPage;

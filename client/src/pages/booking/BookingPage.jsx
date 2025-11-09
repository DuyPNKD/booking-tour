import React, {useState, useEffect} from "react";
import "./BookingPage.css";
import ninhThuan from "../../assets/ninh_thuan.webp";
import {useSearchParams, useParams, Link, useNavigate} from "react-router-dom";
import axios from "axios";

const BookingPage = () => {
    const {id} = useParams();
    const [searchParams] = useSearchParams();
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
        const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
        const fetchTour = async () => {
            const res = await axios.all([axios.get(`${API_BASE}/api/tours/${id}`), axios.get(`${API_BASE}/api/tours/${id}/prices`)]);
            const [tourRes, priceRes] = res;

            setTour(tourRes.data || {});
            setPrices(priceRes.data || {});

            console.log("Tour data:", tourRes.data);
            console.log("Prices data:", priceRes.data);
        };
        fetchTour();
    }, [id]);

    const departureDate = searchParams.get("date") || "";
    const guestCounts = {
        adult: parseInt(searchParams.get("adult") || "1"),
        child58: parseInt(searchParams.get("child58") || "0"),
        child24: parseInt(searchParams.get("child24") || "0"),
        infant: parseInt(searchParams.get("infant") || "0"),
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

        // Tạo payload gửi lên backend
        const payload = {
            tour_id: tour.id,
            gender: formData.gender,
            full_name: formData.name,
            phone_number: formData.phone,
            email: formData.email,
            address: formData.address,
            note: formData.note,
            departure_date: departureDate,
            total_price: totalPrice,
            details: [
                {target_type: "adult", quantity: guestCounts.adult},
                // Giả sử child58 + child24 là loại child, gộp lại
                {target_type: "child", quantity: guestCounts.child58 + guestCounts.child24},
                {target_type: "infant", quantity: guestCounts.infant},
            ].filter((item) => item.quantity > 0), // loại bỏ loại 0 khách
        };

        try {
            const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
            const res = await axios.post(`${API_BASE}/api/booking`, payload);
            if (res.data.success) {
                const bookingId = res.data.bookingId;

                // Chuyển trang sang Payment, truyền bookingId
                navigate(`/payment/${bookingId}`);
            } else {
                showToast("Đặt chỗ thất bại, vui lòng thử lại.");
            }
        } catch (error) {
            console.error(error);
            showToast("Lỗi mạng hoặc server, vui lòng thử lại.");
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

    if (!tour) {
        return <div style={{padding: 40, fontSize: 18}}>Đang tải thông tin tour...</div>;
    }
    return (
        <div className="booking-bg">
            <div className="booking-container">
                <h1 className="booking-form-h1">Đặt chỗ của tôi</h1>
                <p className="booking-form-p">Điền thông tin và xem lại đặt chỗ</p>
                <div style={{display: "flex", gap: 24}}>
                    {/* Left: Form */}
                    <div className="booking-form">
                        {/* Hiển thị thông báo nếu chưa đăng nhập */}

                        {!isLoggedIn && (
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
                                            Tận hưởng các ưu đãi độc quyền, kiếm Điểm Traveloka và quản lý đặt phòng của bạn một cách dễ dàng
                                        </div>
                                    </div>
                                    <div className="booking-login-alert-action">
                                        <Link to="/login" className="booking-login-alert-link">
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
                                Vui lòng cung cấp địa chỉ để sắp xếp cho việc đón tour
                                <span className="booking-required">*</span>
                            </div>
                            <input name="address" type="text" className={`booking-input ${errors.address ? "input-error" : ""}`} placeholder="" value={formData.address} onChange={handleChange} />
                            {errors.address ? <div className="input-error-text">{errors.address}</div> : <span className="input-hint">VD: Số nhà 1, Ngách 37, Ngõ 66 An Hồng, Phường Hồng An, Hải Phòng</span>}
                        </div>
                    </div>
                    {/* Right: Room Info */}
                    <div className="booking-room-info">
                        <div className="booking-room-info-header">
                            <img src="https://d1785e74lyxkqq.cloudfront.net/_next/static/v4.6.0/a/a1499965ef30506d8df751cd6e62b0ff.svg" alt="" />
                            <h3>Tóm tắt đặt chỗ</h3>
                        </div>
                        <div className="booking-room-info-group">
                            <div className="booking-room-tour-title custom-room-title">{tour?.title}</div>
                            <img src={tour?.images[0].image_url} alt={tour?.title} className="booking-room-img" />
                        </div>
                        <div className="booking-room-info-group" style={{background: "#ecf8ff", padding: "8px 4px"}}>
                            <table style={{width: "fit-content", borderSpacing: "8px"}}>
                                <tbody>
                                    <tr>
                                        <td className="booking-room-info-group-title">
                                            <span className="booking-room-info-icon">
                                                <i class="fa-regular fa-calendar tour-price-icon"></i>
                                            </span>
                                            Ngày tham quan
                                        </td>
                                        <td className="booking-room-info-group-value">
                                            <div>
                                                {(() => {
                                                    const date = new Date(departureDate);
                                                    const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
                                                    return `${days[date.getDay()]}, ${date.getDate()} thg ${date.getMonth() + 1} ${date.getFullYear()}`;
                                                })()}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="booking-room-info-group-title">
                                            <span className="booking-room-info-icon">
                                                <i className="fa-solid fa-location-dot tour-price-icon"></i>
                                            </span>
                                            Địa điểm
                                        </td>
                                        <td className="booking-room-info-group-value">{tour?.location_name}</td>
                                    </tr>
                                    <tr>
                                        <td className="booking-room-info-group-title">
                                            <span className="booking-room-info-icon">
                                                <i className="fa-regular fa-clock tour-price-icon"></i>
                                            </span>
                                            Thời gian
                                        </td>
                                        <td className="booking-room-info-group-value">
                                            {tour?.num_day} ngày {tour?.num_night} đêm
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="booking-room-info-group-title">
                                            <span className="booking-room-info-icon">
                                                <i class="fa-solid fa-user-group tour-price-icon"></i>
                                            </span>
                                            Áp dụng cho
                                        </td>
                                        <td className="booking-room-info-group-value">
                                            Người lớn: {guestCounts.adult}, Trẻ em: {guestCounts.child58 + guestCounts.child24}, Em bé: {guestCounts.infant}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="booking-room-total-row booking-room-total-row-custom">
                            <span>Giá bạn trả</span>
                            <span className="booking-room-total-amount-wrapper">
                                <span className="booking-room-total-amount">{totalPrice.toLocaleString("vi-VN")} VND </span>
                                <button
                                    className="price-toggle-btn"
                                    onClick={() => setShowPriceDetail((prev) => !prev)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        marginLeft: 8,
                                        verticalAlign: "middle",
                                        padding: 0,
                                    }}
                                    aria-label={showPriceDetail ? "Ẩn chi tiết" : "Xem chi tiết"}
                                >
                                    {showPriceDetail ? <i className="fa-solid fa-chevron-up" style={{color: "#007aff", fontSize: 18}}></i> : <i className="fa-solid fa-chevron-down" style={{color: "#007aff", fontSize: 18}}></i>}
                                </button>
                            </span>
                        </div>
                        {showPriceDetail && (
                            <div className="booking-room-price-detail">
                                <div className="booking-room-price-detail-row">
                                    <span>Người lớn ({guestCounts.adult}x)</span>
                                    <span>{(getPriceByType("adult") * guestCounts.adult).toLocaleString()} VND</span>
                                </div>
                                {guestCounts.child58 + guestCounts.child24 > 0 && (
                                    <div className="booking-room-price-detail-row">
                                        <span>Trẻ em ({guestCounts.child58 + guestCounts.child24}x)</span>
                                        <span>{(getPriceByType("child") * guestCounts.child58).toLocaleString()} VND</span>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="booking-room-info-group">
                            <button className="booking-submit-btn" onClick={handleContinue}>
                                Tiếp tục
                            </button>
                        </div>
                        {toastMessage && (
                            <div className="toast-container">
                                <div className="toast-message">
                                    <span>{toastMessage}</span>
                                    <button className="toast-close-btn" onClick={closeToast}>
                                        Đóng
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
                </div>
            </div>
        </div>
    );
};

export default BookingPage;

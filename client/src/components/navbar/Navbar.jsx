import React, {useEffect, useState} from "react";
import {Link, useNavigate, useLocation} from "react-router-dom";
import "./Navbar.css";

import Search from "../Search/Search";
import axios from "axios";
import {useAuth} from "../../context/AuthContext"; // 👉 lấy từ context

const Navbar = () => {
    const [domesticRegions, setDomesticRegions] = useState([]);
    const [internationalRegions, setInternationalRegions] = useState([]);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hoveredDomestic, setHoveredDomestic] = useState([]);
    const [hoveredInternational, setHoveredInternational] = useState([]);
    const [showAuthPopup, setShowAuthPopup] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const {user, logout} = useAuth(); // 👉 lấy từ context

    const navigate = useNavigate();

    // Sử dụng useLocation để lấy thông tin đường dẫn
    const location = useLocation();
    const isBookingPage = location.pathname.startsWith("/booking");
    const isPaymentPage = location.pathname.startsWith("/payment");
    const isPaymentResultPage = location.pathname.startsWith("/payment-result");

    const isBookingFlow = isBookingPage || isPaymentPage || isPaymentResultPage;
    const currentStep = isPaymentResultPage ? 3 : isPaymentPage ? 2 : 1;

    const menuItems = [
        {text: "Tour trong nước", path: "/danh-muc-tour?type=domestic"},
        {text: "Tour nước ngoài", path: "/danh-muc-tour?type=international"},
        {text: "Cẩm nang du lịch", path: "/travel-guide"},
        {text: "Liên hệ", path: "/contact"},
    ];

    useEffect(() => {
        // Fetch navbar data from the server
        const fetchNavbarData = async () => {
            try {
                const response = await axios.get("http://localhost:3000/navbar-menu");
                setDomesticRegions(response.data.domestic);
                setInternationalRegions(response.data.international);

                if (response.data.domestic.length > 0) setHoveredDomestic(response.data.domestic[0].displayName);
                if (response.data.international.length > 0) setHoveredInternational(response.data.international[0].displayName);
            } catch (error) {
                console.error("Error fetching navbar data:", error);
            }
        };

        fetchNavbarData();
    }, []);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-left">
                    <Link to="/" className="navbar-logo">
                        <img src="/logo.png" alt="DTravel Logo" className="navbar-logo-image" />
                    </Link>
                </div>

                {isBookingFlow ? (
                    // Navbar cho trang booking
                    <div className="navbar-center"></div>
                ) : (
                    <div className="navbar-center">
                        <ul className="navbar-menu">
                            {/* Tour trong nước */}
                            <li className="navbar-menu-dropdown">
                                <Link to="/danh-muc-tour?type=domestic" className="navbar-menu-item">
                                    Tour trong nước
                                </Link>

                                <div className="mega-menu">
                                    <div className="mega-menu-left">
                                        {domesticRegions.map((region) => (
                                            <div
                                                key={region.displayName}
                                                className={`mega-menu-region${hoveredDomestic === region.displayName ? " active" : ""}`}
                                                onMouseEnter={() => setHoveredDomestic(region.displayName)}
                                                onClick={() => navigate(`/danh-muc-tour?region_id=${region.id}`)}
                                            >
                                                {region.displayName}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mega-menu-right">
                                        <div className="mega-menu-content">
                                            <p className="mega-menu-title">Khám phá các điểm đến</p>
                                            {(() => {
                                                const currentDomestic = domesticRegions.find((region) => region.displayName === hoveredDomestic);
                                                return (
                                                    currentDomestic &&
                                                    currentDomestic.destinations.map((dest) => (
                                                        <div className="mega-menu-group-container" key={dest.group}>
                                                            <div
                                                                className="mega-menu-group"
                                                                onClick={() => navigate(`/danh-muc-tour?subregion_id=${dest.id}`)}
                                                            >
                                                                {dest.group}
                                                            </div>
                                                            <div className="mega-menu-places">
                                                                {dest.places.map((place) => (
                                                                    <span
                                                                        key={place.id}
                                                                        className="mega-menu-place"
                                                                        onClick={() => navigate(`/danh-muc-tour?location_id=${place.id}`)}
                                                                    >
                                                                        {place.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </li>
                            {/* Tour nước ngoài */}
                            <li className="navbar-menu-dropdown">
                                <Link to="/tours?type=international" className="navbar-menu-item">
                                    Tour nước ngoài
                                </Link>
                                <div className="mega-menu">
                                    <div className="mega-menu-left">
                                        {internationalRegions.map((region) => (
                                            <div
                                                key={region.displayName}
                                                className={`mega-menu-region${hoveredInternational === region.displayName ? " active" : ""}`}
                                                onMouseEnter={() => setHoveredInternational(region.displayName)}
                                                onClick={() => navigate(`/danh-muc-tour?region_id=${region.id}`)}
                                            >
                                                {region.displayName}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mega-menu-right">
                                        <div className="mega-menu-content">
                                            <p className="mega-menu-title">Khám phá các điểm đến</p>
                                            {(() => {
                                                const currentDomestic = internationalRegions.find(
                                                    (region) => region.displayName === hoveredInternational
                                                );
                                                return (
                                                    currentDomestic &&
                                                    currentDomestic.destinations.map((dest) => (
                                                        <div className="mega-menu-group-container" key={dest.group}>
                                                            <div
                                                                className="mega-menu-group"
                                                                onClick={() => navigate(`/danh-muc-tour?subregion_id=${dest.id}`)}
                                                            >
                                                                {dest.group}
                                                            </div>
                                                            <div className="mega-menu-places">
                                                                {dest.places.map((place) => (
                                                                    <span
                                                                        key={place.id}
                                                                        className="mega-menu-place"
                                                                        onClick={() => navigate(`/danh-muc-tour?location_id=${place.id}`)}
                                                                    >
                                                                        {place.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <Link to="/blog?category=travel-guide" className="navbar-menu-item">
                                    Cẩm nang du lịch
                                </Link>
                            </li>
                            <li>
                                <span className="navbar-menu-item">Liên hệ</span>
                            </li>
                        </ul>
                    </div>
                )}

                {isBookingFlow ? (
                    // Navbar cho trang booking
                    <div className="booking-steps">
                        <div className={`step ${currentStep >= 1 ? "active" : ""} ${currentStep > 1 ? "completed" : ""}`}>
                            <span className="step-number">1</span>
                            <span className="step-text">Đặt</span>
                        </div>
                        <div className={`step ${currentStep >= 2 ? "active" : ""} ${currentStep > 2 ? "completed" : ""}`}>
                            <span className="step-number">2</span>
                            <span className="step-text">Thanh toán</span>
                        </div>
                        <div className={`step ${currentStep === 3 ? "active" : ""}`}>
                            <span className="step-number">3</span>
                            <span className="step-text">Kết quả</span>
                        </div>
                    </div>
                ) : (
                    <div className="navbar-right">
                        {user ? (
                            // Khi đã login -> hiện tên user hoặc avatar
                            <div className="navbar-user-info" onClick={() => setShowUserDropdown(!showUserDropdown)}>
                                {(() => {
                                    // Lấy base URL của API từ biến môi trường, nếu không có dùng localhost
                                    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
                                    // Tính toán đường dẫn avatar dựa trên user.picture:
                                    // Nếu user.picture có giá trị, kiểm tra xem nó có bắt đầu bằng "/" hay không
                                    // Nếu có, nối API_BASE trước nó, nếu không thì để nguyên (giả sử nó là đường dẫn đầy đủ)
                                    // Nếu không có avatar, dùng ảnh mặc định "/default-avatar.jpg"
                                    const avatarSrc = user.picture
                                        ? user.picture.startsWith("/")
                                            ? API_BASE + user.picture
                                            : user.picture
                                        : "/default-avatar.jpg";
                                    // Trả về thẻ img hiển thị avatar và xử lý lỗi nếu ảnh không load được
                                    return (
                                        <img
                                            src={avatarSrc}
                                            alt="avatar"
                                            className="navbar-user-avatar"
                                            // Nếu gặp lỗi tải ảnh thì gán lại src là ảnh mặc định
                                            onError={(e) => {
                                                e.target.src = "/default-avatar.jpg";
                                                console.log("Lỗi tải ảnh avatar");
                                            }}
                                        />
                                    );
                                })()}
                                <span className="navbar-user-name">{user.name}</span>
                                <i className={`fa-solid fa-chevron-down navbar-user-chevron${showUserDropdown ? " open" : ""}`}></i>
                                {showUserDropdown && (
                                    <div className="navbar-user-dropdown">
                                        <div
                                            className="navbar-user-dropdown-item"
                                            onClick={() => {
                                                navigate("/dashboard/trips");
                                                setShowUserDropdown(false);
                                            }}
                                        >
                                            Kỳ nghỉ của tôi
                                        </div>
                                        <div
                                            className="navbar-user-dropdown-item"
                                            onClick={() => {
                                                navigate("/dashboard/voucher");
                                                setShowUserDropdown(false);
                                            }}
                                        >
                                            Voucher của tôi
                                        </div>
                                        <div
                                            className="navbar-user-dropdown-item"
                                            onClick={() => {
                                                navigate("/dashboard/profile");
                                                setShowUserDropdown(false);
                                            }}
                                        >
                                            Hồ sơ của tôi
                                        </div>
                                        <button className="navbar-user-logout-btn" onClick={logout}>
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Khi chưa login -> hiện nút Đăng Nhập và Đăng ký
                            <>
                                <button className="navbar-login-btn" onClick={() => navigate("/auth/login?step=signin")}>
                                    <i class="fa-solid fa-user"></i> Đăng Nhập
                                </button>
                                <button className="navbar-register-btn" onClick={() => navigate("/auth/login?step=signup")}>
                                    Đăng ký
                                </button>
                            </>
                        )}
                    </div>
                )}

                <button className="mobile-menu-button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    ☰
                </button>

                <div className={`mobile-menu ${isMobileMenuOpen ? "active" : ""}`}>
                    {menuItems.map((item) => (
                        <Link key={item.text} to={item.path} className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>
                            {item.text}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

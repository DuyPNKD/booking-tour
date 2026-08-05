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
                const API_BASE = import.meta.env.VITE_API_BASE || "";
                const response = await axios.get(`${API_BASE}/navbar-menu`);
                const domestic = response.data?.domestic || response.data?.Domestic || [];
                const international = response.data?.international || response.data?.International || [];

                setDomesticRegions(domestic);
                setInternationalRegions(international);

                if (domestic.length > 0) setHoveredDomestic(domestic[0].display_name || domestic[0].displayName);
                if (international.length > 0) setHoveredInternational(international[0].display_name || international[0].displayName);
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
                                        {(domesticRegions || []).map((region) => {
                                            const name = region.display_name || region.displayName || region.name;
                                            return (
                                                <div
                                                    key={region.id}
                                                    className={`mega-menu-region${hoveredDomestic === name ? " active" : ""}`}
                                                    onMouseEnter={() => setHoveredDomestic(name)}
                                                    onClick={() => navigate(`/danh-muc-tour?region_id=${region.id}`)}
                                                >
                                                    {name}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mega-menu-right">
                                        <div className="mega-menu-content">
                                            <p className="mega-menu-title">Khám phá các điểm đến</p>
                                            {(() => {
                                                const currentDomestic = (domesticRegions || []).find((region) => (region.display_name || region.displayName || region.name) === hoveredDomestic);
                                                return (
                                                    currentDomestic &&
                                                    (currentDomestic.destinations || []).map((dest) => (
                                                        <div className="mega-menu-group-container" key={dest.group || dest.id}>
                                                            <div
                                                                className="mega-menu-group"
                                                                onClick={() => navigate(`/danh-muc-tour?subregion_id=${dest.id}`)}
                                                            >
                                                                {dest.group}
                                                            </div>
                                                            <div className="mega-menu-places">
                                                                {(dest.places || []).map((place) => (
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
                                <Link to="/danh-muc-tour?type=international" className="navbar-menu-item">
                                    Tour nước ngoài
                                </Link>
                                <div className="mega-menu">
                                    <div className="mega-menu-left">
                                        {(internationalRegions || []).map((region) => {
                                            const name = region.display_name || region.displayName || region.name;
                                            return (
                                                <div
                                                    key={region.id}
                                                    className={`mega-menu-region${hoveredInternational === name ? " active" : ""}`}
                                                    onMouseEnter={() => setHoveredInternational(name)}
                                                    onClick={() => navigate(`/danh-muc-tour?region_id=${region.id}`)}
                                                >
                                                    {name}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mega-menu-right">
                                        <div className="mega-menu-content">
                                            <p className="mega-menu-title">Khám phá các điểm đến</p>
                                            {(() => {
                                                const currentInt = (internationalRegions || []).find(
                                                    (region) => (region.display_name || region.displayName || region.name) === hoveredInternational
                                                );
                                                return (
                                                    currentInt &&
                                                    (currentInt.destinations || []).map((dest) => (
                                                        <div className="mega-menu-group-container" key={dest.group || dest.id}>
                                                            <div
                                                                className="mega-menu-group"
                                                                onClick={() => navigate(`/danh-muc-tour?subregion_id=${dest.id}`)}
                                                            >
                                                                {dest.group}
                                                            </div>
                                                            <div className="mega-menu-places">
                                                                {(dest.places || []).map((place) => (
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
                                <Link to="/contact" className="navbar-menu-item">
                                    Liên hệ
                                </Link>
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
                                    const API_BASE = import.meta.env.VITE_API_BASE || "";
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
                                    <i className="fa-solid fa-user"></i> Đăng Nhập
                                </button>
                                <button className="navbar-register-btn" onClick={() => navigate("/auth/login?step=signup")}>
                                    Đăng ký
                                </button>
                            </>
                        )}
                    </div>
                )}

                <button 
                    className="mobile-menu-toggle" 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle Navigation"
                >
                    <i className={isMobileMenuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
                </button>

                {/* Mobile Menu Backdrop */}
                {isMobileMenuOpen && (
                    <div className="mobile-menu-backdrop" onClick={() => setIsMobileMenuOpen(false)}></div>
                )}

                {/* Mobile Menu Drawer */}
                <div className={`mobile-menu-drawer ${isMobileMenuOpen ? "open" : ""}`}>
                    <div className="mobile-menu-header">
                        <img src="/logo.png" alt="DTravel Logo" className="mobile-menu-logo" />
                        <button className="mobile-menu-close" onClick={() => setIsMobileMenuOpen(false)}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div className="mobile-menu-links">
                        <Link to="/danh-muc-tour?type=domestic" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                            <i className="fa-solid fa-map-location-dot"></i> Tour trong nước
                        </Link>
                        <Link to="/danh-muc-tour?type=international" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                            <i className="fa-solid fa-earth-americas"></i> Tour nước ngoài
                        </Link>
                        <Link to="/blog?category=travel-guide" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                            <i className="fa-solid fa-book-open"></i> Cẩm nang du lịch
                        </Link>
                        <Link to="/contact" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                            <i className="fa-solid fa-headset"></i> Liên hệ
                        </Link>
                    </div>

                    <div className="mobile-menu-auth">
                        {user ? (
                            <div className="mobile-user-box">
                                <div className="mobile-user-profile">
                                    <img
                                        src={
                                            user.picture
                                                ? user.picture.startsWith("/")
                                                    ? (import.meta.env.VITE_API_BASE || "") + user.picture
                                                    : user.picture
                                                : "/default-avatar.jpg"
                                        }
                                        alt="avatar"
                                        className="mobile-user-avatar"
                                        onError={(e) => (e.target.src = "/default-avatar.jpg")}
                                    />
                                    <div className="mobile-user-details">
                                        <span className="mobile-user-name">{user.name}</span>
                                        <span className="mobile-user-email">{user.email}</span>
                                    </div>
                                </div>
                                <div className="mobile-user-links">
                                    <Link to="/dashboard/trips" onClick={() => setIsMobileMenuOpen(false)}>
                                        <i className="fa-solid fa-suitcase"></i> Kỳ nghỉ của tôi
                                    </Link>
                                    <Link to="/dashboard/voucher" onClick={() => setIsMobileMenuOpen(false)}>
                                        <i className="fa-solid fa-ticket"></i> Voucher của tôi
                                    </Link>
                                    <Link to="/dashboard/profile" onClick={() => setIsMobileMenuOpen(false)}>
                                        <i className="fa-solid fa-user-gear"></i> Hồ sơ của tôi
                                    </Link>
                                    <button className="mobile-logout-btn" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                                        <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mobile-auth-btns">
                                <button className="mobile-login-btn" onClick={() => { navigate("/auth/login?step=signin"); setIsMobileMenuOpen(false); }}>
                                    <i className="fa-solid fa-right-to-bracket"></i> Đăng Nhập
                                </button>
                                <button className="mobile-register-btn" onClick={() => { navigate("/auth/login?step=signup"); setIsMobileMenuOpen(false); }}>
                                    Đăng Ký
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

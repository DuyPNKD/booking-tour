import React, {useState} from "react";
import {Link} from "react-router-dom";
import "./Navbar.css";
import AuthPopup from "../authPopup/AuthPopup";

const domesticRegions = [
    {
        name: "Tour Miền Bắc",
        destinations: [
            {group: "Khu vực gần Hà Nội", places: ["Tuyên Quang", "Phú Thọ", "Hà Nội", "Ba Vì", "Vĩnh Phúc", "Hưng Yên", "Hà Nam", "Ninh Bình", "Nam Định", "Thái Bình", "Hải Phòng", "Cát Bà", "Đồ Sơn"]},
            {group: "Tây Bắc", places: ["Lào Cai", "Sapa", "Y Tý", "Sơn La", "Mộc Châu", "Tà Xùa", "Yên Bái", "Mù Cang Chải", "Điện Biên", "Hòa Bình", "Mai Châu"]},
            {group: "Đông Bắc", places: ["Hà Giang", "Hoàng Su Phì", "Cao Bằng", "Ba Bể - Bản Giốc", "Bắc Kạn", "Lạng Sơn", "Bắc Giang"]},
            {group: "Quảng Ninh", places: ["Bình Liêu", "Cô Tô", "Quan Lạn", "Hạ Long", "Trà Cổ"]},
        ],
    },
    {
        name: "Tour Miền Trung",
        destinations: [{group: "Miền Trung", places: ["Đà Nẵng", "Hội An", "Nha Trang"]}],
    },
    {
        name: "Tour Miền Nam",
        destinations: [{group: "Miền Nam", places: ["Hồ Chí Minh", "Phú Quốc", "Côn Đảo"]}],
    },
];

const internationalRegions = [
    {
        name: "Châu Á",
        destinations: [
            {group: "Đông Nam Á", places: ["Thái Lan", "Singapore", "Malaysia", "Indonesia"]},
            {group: "Đông Bắc Á", places: ["Hàn Quốc", "Nhật Bản", "Trung Quốc", "Đài Loan"]},
        ],
    },
    {
        name: "Châu Âu",
        destinations: [{group: "Tây Âu", places: ["Pháp", "Đức", "Ý", "Tây Ban Nha"]}],
    },
    {
        name: "Châu Úc",
        destinations: [{group: "Châu Úc", places: ["Úc", "New Zealand"]}],
    },
];

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hoveredDomestic, setHoveredDomestic] = useState(domesticRegions[0].name);
    const [hoveredInternational, setHoveredInternational] = useState(internationalRegions[0].name);
    const [showAuthPopup, setShowAuthPopup] = useState(false);

    const menuItems = [
        {text: "Tour trong nước", path: "/danh-muc-tour?type=domestic"},
        {text: "Tour nước ngoài", path: "/danh-muc-tour?type=international"},
        {text: "Cẩm nang du lịch", path: "/travel-guide"},
        {text: "Liên hệ", path: "/contact"},
    ];

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <img src="/logo.png" alt="DTravel Logo" className="navbar-logo-image" />
                </Link>

                <ul className="navbar-menu">
                    {/* Tour trong nước */}
                    <li className="navbar-menu-dropdown">
                        <Link to="/danh-muc-tour?type=domestic" className="navbar-menu-item">
                            Tour trong nước
                        </Link>
                        <div className="mega-menu">
                            <div className="mega-menu-left">
                                {domesticRegions.map((region) => (
                                    <div key={region.name} className={`mega-menu-region${hoveredDomestic === region.name ? " active" : ""}`} onMouseEnter={() => setHoveredDomestic(region.name)}>
                                        {region.name}
                                    </div>
                                ))}
                            </div>
                            <div className="mega-menu-right">
                                <div className="mega-menu-content">
                                    <p className="mega-menu-title">Khám phá các điểm đến</p>
                                    {domesticRegions
                                        .find((region) => region.name === hoveredDomestic)
                                        .destinations.map((dest) => (
                                            <div className="mega-menu-group-container" key={dest.group}>
                                                <div className="mega-menu-group">{dest.group}</div>
                                                <div className="mega-menu-places">
                                                    {dest.places.map((place) => (
                                                        <span key={place} className="mega-menu-place">
                                                            {place}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
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
                                    <div key={region.name} className={`mega-menu-region${hoveredInternational === region.name ? " active" : ""}`} onMouseEnter={() => setHoveredInternational(region.name)}>
                                        {region.name}
                                    </div>
                                ))}
                            </div>
                            <div className="mega-menu-right">
                                <div className="mega-menu-content">
                                    <p className="mega-menu-title">Khám phá các điểm đến</p>
                                    {internationalRegions
                                        .find((region) => region.name === hoveredInternational)
                                        .destinations.map((dest) => (
                                            <div className="mega-menu-group-container" key={dest.group}>
                                                <div className="mega-menu-group">{dest.group}</div>
                                                <div className="mega-menu-places">
                                                    {dest.places.map((place) => (
                                                        <span key={place} className="mega-menu-place">
                                                            {place}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </li>
                    <li>
                        <span className="navbar-menu-item">Cẩm nang du lịch</span>
                    </li>
                    <li style={{position: "relative"}}>
                        <span className={`navbar-menu-item${showAuthPopup ? " active" : ""}`} onClick={() => setShowAuthPopup((v) => !v)} style={{cursor: "pointer"}}>
                            Tài khoản
                        </span>
                        {showAuthPopup && <AuthPopup onClose={() => setShowAuthPopup(false)} />}
                    </li>
                </ul>

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

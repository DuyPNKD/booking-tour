import React, {useState} from "react";
import {Link} from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        {text: "Trang chủ", path: "/"},
        {text: "Tour trong nước", path: "/tours?type=domestic"},
        {text: "Tour nước ngoài", path: "/tours?type=international"},
        {text: "Cẩm nang du lịch", path: "/travel-guide"},
        {text: "Liên hệ", path: "/contact"},
    ];

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    TOUR BOOKING
                </Link>

                <ul className="navbar-menu">
                    {menuItems.map((item) => (
                        <li key={item.text}>
                            <Link to={item.path} className="navbar-menu-item">
                                {item.text}
                            </Link>
                        </li>
                    ))}
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

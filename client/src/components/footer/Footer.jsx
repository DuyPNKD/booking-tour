import React from "react";
import "./Footer.css";

// src/components/Footer.jsx
function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Logo và thông tin công ty */}
                <div className="footer-column">
                    <img src="/logo.png" alt="DTravel Logo" className="footer-logo" />
                    <h3>Công ty TNHH du lịch DTravel</h3>
                    <ul>
                        <li>Giấy phép kinh doanh số 0105225586 - Sở kế hoạch và đầu tư Thành phố Hà Nội cấp ngày 29/03/2011</li>
                        <li>Giấy phép Kinh doanh Lữ hành Quốc tế số 01771/2015/TCDL-GPLHQT</li>
                    </ul>
                </div>

                {/* Hoạt động */}
                <div className="footer-column">
                    <h3>Hoạt động</h3>
                    <ul>
                        <li>
                            <a href="#">Về DTravel</a>
                        </li>
                        <li>
                            <a href="#">Khách hàng nói về DTravel</a>
                        </li>
                        <li>
                            <a href="#">Tuyển dụng</a>
                        </li>
                        <li>
                            <a href="#">Hoạt động của DTravel</a>
                        </li>
                        <li>
                            <a href="#">Báo chí nói về DTravel</a>
                        </li>
                        <li>
                            <a href="#">Blog du lịch</a>
                        </li>
                    </ul>
                </div>

                {/* Thông tin hữu ích */}
                <div className="footer-column">
                    <h3>Thông tin hữu ích</h3>
                    <ul>
                        <li>
                            <a href="#">Hình thức thanh toán</a>
                        </li>
                        <li>
                            <a href="#">Chính sách hoàn hủy</a>
                        </li>
                        <li>
                            <a href="#">Điều khoản sử dụng</a>
                        </li>
                        <li>
                            <a href="#">Chính sách bảo mật</a>
                        </li>
                        <li>
                            <a href="#">Bản quyền hình ảnh</a>
                        </li>
                        <li>
                            <a href="#">Liên hệ</a>
                        </li>
                    </ul>
                </div>

                {/* Thông tin liên lạc */}
                <div className="footer-column">
                    <h3>Thông tin liên lạc</h3>
                    <ul>
                        <li>Trụ sở chính tại Hà Nội</li>
                        <li>Số 5, Lô 1C, Trung Yên 11C, Trung Hòa, Cầu Giấy, Hà Nội</li>
                        <li>Văn phòng đại diện tại TP. Hồ Chí Minh</li>
                        <li>354-356 Nguyễn Thị Minh Khai, Phường 5, Quận 3, TP. Hồ Chí Minh</li>
                        <li>1900 3440</li>
                        <li>
                            <a href="mailto:contact@pystravel.com">contact@dtravel.com</a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Footer bottom */}
            <div className="footer-bottom">
                <p>Copyright © 2011-2024. All Rights Reserved by DTravel</p>
                <div className="footer-icons">
                    <a href="#">
                        <i className="fa-brands fa-facebook"></i>
                    </a>
                    <a href="#">
                        <i className="fa-brands fa-zalo"></i>
                    </a>
                    <a href="#">
                        <i className="fa-brands fa-instagram"></i>
                    </a>
                    <a href="#">
                        <i className="fa-brands fa-youtube"></i>
                    </a>
                    <a href="#">
                        <i className="fa-brands fa-tiktok"></i>
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

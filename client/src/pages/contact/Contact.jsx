import React, { useState } from "react";
import { message as antMessage } from "antd";
import "./Contact.css";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        subject: "tu-van-tour",
        message: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.message) {
            antMessage.warning("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Nội dung tin nhắn!");
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            antMessage.success("Cảm ơn bạn! DTravel đã nhận được thông tin liên hệ và sẽ gọi lại hỗ trợ trong 15 phút.");
            setFormData({
                name: "",
                phone: "",
                email: "",
                subject: "tu-van-tour",
                message: "",
            });
        }, 1000);
    };

    return (
        <div className="contact-page">
            {/* Hero Header */}
            <div className="contact-hero">
                <div className="contact-hero-content">
                    <h1 className="contact-hero-title">Liên Hệ Với DTravel</h1>
                    <p className="contact-hero-subtitle">
                        Chúng tôi luôn sẵn sàng lắng nghe, giải đáp thắc mắc và đồng hành cùng bạn trên mọi hành trình khám phá!
                    </p>
                </div>
            </div>

            <div className="contact-container">
                {/* 4 Cards Thông Tin Liên Hệ */}
                <div className="contact-cards-grid">
                    <div className="contact-info-card">
                        <div className="contact-icon-box">
                            <i className="fa-solid fa-building"></i>
                        </div>
                        <h3 className="contact-card-title">Trụ Sở Hà Nội</h3>
                        <p className="contact-card-desc">Số 5, Lô 1C, Trung Yên 11C, Trung Hòa, Cầu Giấy, Hà Nội</p>
                        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="contact-card-action">
                            Xem bản đồ <i className="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>

                    <div className="contact-info-card">
                        <div className="contact-icon-box">
                            <i className="fa-solid fa-location-dot"></i>
                        </div>
                        <h3 className="contact-card-title">Văn Phòng TP.HCM</h3>
                        <p className="contact-card-desc">354-356 Nguyễn Thị Minh Khai, Phường 5, Quận 3, TP. Hồ Chí Minh</p>
                        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="contact-card-action">
                            Xem bản đồ <i className="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>

                    <div className="contact-info-card">
                        <div className="contact-icon-box">
                            <i className="fa-solid fa-phone-volume"></i>
                        </div>
                        <h3 className="contact-card-title">Hotline Hỗ Trợ 24/7</h3>
                        <p className="contact-card-desc">1900 3440 (Tư vấn Tour)<br />0988 123 456 (Hỗ trợ khẩn cấp)</p>
                        <a href="tel:19003440" className="contact-card-action">
                            Gọi ngay <i className="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>

                    <div className="contact-info-card">
                        <div className="contact-icon-box">
                            <i className="fa-solid fa-envelope-open-text"></i>
                        </div>
                        <h3 className="contact-card-title">Email Liên Hệ</h3>
                        <p className="contact-card-desc">contact@dtravel.com<br />support@dtravel.com</p>
                        <a href="mailto:contact@dtravel.com" className="contact-card-action">
                            Gửi email <i className="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </div>

                {/* Form & Map Section */}
                <div className="contact-main-grid">
                    {/* Left Form */}
                    <div className="contact-form-box">
                        <h2 className="contact-form-title">Gửi Thông Tin Cho DTravel</h2>
                        <p className="contact-form-sub">Vui lòng điền thông tin bên dưới, nhân viên tư vấn của chúng tôi sẽ liên hệ lại ngay!</p>

                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-group-row">
                                <div className="form-group">
                                    <label htmlFor="name">Họ và tên *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="form-control-custom"
                                        placeholder="Nguyễn Văn A"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Số điện thoại *</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        className="form-control-custom"
                                        placeholder="0912 345 678"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group-row">
                                <div className="form-group">
                                    <label htmlFor="email">Địa chỉ Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="form-control-custom"
                                        placeholder="example@gmail.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="subject">Chủ đề tư vấn</label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        className="form-control-custom"
                                        value={formData.subject}
                                        onChange={handleChange}
                                    >
                                        <option value="tu-van-tour">Tư vấn Tour du lịch</option>
                                        <option value="dat-tour-doan">Đặt Tour cho đoàn / Doanh nghiệp</option>
                                        <option value="visa-ve-may-bay">Hỗ trợ Visa & Vé máy bay</option>
                                        <option value="gop-y-khieu-nai">Góp ý & Khiếu nại dịch vụ</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Nội dung tin nhắn *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    className="form-control-custom"
                                    placeholder="Nhập chi tiết yêu cầu tư vấn tour, ngày khởi hành dự kiến, số lượng khách..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-submit-contact" disabled={loading}>
                                {loading ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i> Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-paper-plane"></i> Gửi Thông Tin Liên Hệ
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Right Google Maps */}
                    <div className="contact-map-box">
                        <div className="contact-map-header">
                            <h3>Bản Đồ Chỉ Đường</h3>
                            <p>Ghé thăm văn phòng DTravel tại Hà Nội</p>
                        </div>
                        <div className="map-iframe-container">
                            <iframe
                                title="DTravel Office Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.5065406734135!2d105.79555137599026!3d21.012409887342686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135aca1d1b505f5%3A0xb35a39626e2e5e1e!2zVHLGsG5nIFnDqm4gMTFDLCBUcnVuZyBIb8Custom!5e0!3m2!1svi!2s!4v1710000000000!5m2!1svi!2s"
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="contact-faq-section">
                    <h2 className="faq-title">Câu Hỏi Thường Gặp</h2>
                    <div className="faq-grid">
                        <div className="faq-item">
                            <div className="faq-question">
                                <i className="fa-solid fa-circle-question"></i>
                                Thời gian làm việc của DTravel như thế nào?
                            </div>
                            <p className="faq-answer">
                                DTravel phục vụ quý khách từ 08:00 - 18:00 (Từ Thứ 2 đến Thứ 7). Tổng đài tư vấn trực tuyến và giải đáp thắc mắc hoạt động 24/7.
                            </p>
                        </div>

                        <div className="faq-item">
                            <div className="faq-question">
                                <i className="fa-solid fa-circle-question"></i>
                                Tôi có thể thanh toán tiền tour bằng những hình thức nào?
                            </div>
                            <p className="faq-answer">
                                Bạn có thể thanh toán bằng chuyển khoản ngân hàng, thẻ tín dụng Visa/MasterCard, cổng VNPay/ZaloPay hoặc nộp tiền mặt trực tiếp tại văn phòng.
                            </p>
                        </div>

                        <div className="faq-item">
                            <div className="faq-question">
                                <i className="fa-solid fa-circle-question"></i>
                                Thủ tục hoãn hủy hoặc đổi tour được quy định ra sao?
                            </div>
                            <p className="faq-answer">
                                Quý khách vui lòng tham khảo chi tiết tại trang Chính Sách Hoàn Hủy hoặc liên hệ trực tiếp nhân viên phụ trách tour để được hỗ trợ cụ thể.
                            </p>
                        </div>

                        <div className="faq-item">
                            <div className="faq-question">
                                <i className="fa-solid fa-circle-question"></i>
                                DTravel có thiết kế Tour riêng cho đoàn doanh nghiệp không?
                            </div>
                            <p className="faq-answer">
                                Có! Chúng tôi chuyên thiết kế Tour MICE, Teambuilding và Gala Dinner độc quyền dành riêng cho công ty, tập thể theo mọi ngân sách.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;

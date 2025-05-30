import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import "./Tours.css"; // Tạo file css này để style
import ninhThuan from "../../assets/ninh_thuan.webp";
const mockTours = [
    {
        id: 1,
        image: ninhThuan,
        title: "Tour Vĩnh Hy - Ninh Thuận 3 ngày 2 đêm từ TP.HCM",
        location: "Hồ Chí Minh",
        duration: "3 ngày 2 đêm",
        schedule: "Thứ 6 hàng tuần",
        price: 3380000,
        oldPrice: 4056000,
        promotions: ["Khuyến mãi Đặt xa", "Khuyến mãi cho Khách hàng thân thiết", "Khuyến mãi Đặt theo Nhóm", "Khuyến mãi cho Người Cao tuổi"],
    },
    {
        id: 2,
        image: ninhThuan,
        title: "Tour Vĩnh Hy - Ninh Thuận 3 ngày 2 đêm từ TP.HCM",
        location: "Hồ Chí Minh",
        duration: "3 ngày 2 đêm",
        schedule: "Thứ 6 hàng tuần",
        price: 3380000,
        oldPrice: 4056000,
        promotions: ["Khuyến mãi Đặt xa", "Khuyến mãi cho Khách hàng thân thiết", "Khuyến mãi Đặt theo Nhóm", "Khuyến mãi cho Người Cao tuổi"],
    },
    {
        id: 3,
        image: ninhThuan,
        title: "Tour Vĩnh Hy - Ninh Thuận 3 ngày 2 đêm từ TP.HCM",
        location: "Hồ Chí Minh",
        duration: "3 ngày 2 đêm",
        schedule: "Thứ 6 hàng tuần",
        price: 3380000,
        oldPrice: 4056000,
        promotions: ["Khuyến mãi Đặt xa", "Khuyến mãi cho Khách hàng thân thiết", "Khuyến mãi Đặt theo Nhóm", "Khuyến mãi cho Người Cao tuổi"],
    },
    {
        id: 4,
        image: ninhThuan,
        title: "Tour Vĩnh Hy - Ninh Thuận 3 ngày 2 đêm từ TP.HCM",
        location: "Hồ Chí Minh",
        duration: "3 ngày 2 đêm",
        schedule: "Thứ 6 hàng tuần",
        price: 3380000,
        oldPrice: 4056000,
        promotions: ["Khuyến mãi Đặt xa", "Khuyến mãi cho Khách hàng thân thiết", "Khuyến mãi Đặt theo Nhóm", "Khuyến mãi cho Người Cao tuổi"],
    },
    {
        id: 5,
        image: ninhThuan,
        title: "Tour Vĩnh Hy - Ninh Thuận 3 ngày 2 đêm từ TP.HCM",
        location: "Hồ Chí Minh",
        duration: "3 ngày 2 đêm",
        schedule: "Thứ 6 hàng tuần",
        price: 3380000,
        oldPrice: 4056000,
        promotions: ["Khuyến mãi Đặt xa", "Khuyến mãi cho Khách hàng thân thiết", "Khuyến mãi Đặt theo Nhóm", "Khuyến mãi cho Người Cao tuổi"],
    },
    {
        id: 6,
        image: ninhThuan,
        title: "Tour Vĩnh Hy - Ninh Thuận 3 ngày 2 đêm từ TP.HCM",
        location: "Hồ Chí Minh",
        duration: "3 ngày 2 đêm",
        schedule: "Thứ 6 hàng tuần",
        price: 3380000,
        oldPrice: 4056000,
        promotions: ["Khuyến mãi Đặt xa", "Khuyến mãi cho Khách hàng thân thiết", "Khuyến mãi Đặt theo Nhóm", "Khuyến mãi cho Người Cao tuổi"],
    },
    {
        id: 7,
        image: ninhThuan,
        title: "Tour Vĩnh Hy - Ninh Thuận 3 ngày 2 đêm từ TP.HCM",
        location: "Hồ Chí Minh",
        duration: "3 ngày 2 đêm",
        schedule: "Thứ 6 hàng tuần",
        price: 3380000,
        oldPrice: 4056000,
        promotions: ["Khuyến mãi Đặt xa", "Khuyến mãi cho Khách hàng thân thiết", "Khuyến mãi Đặt theo Nhóm", "Khuyến mãi cho Người Cao tuổi"],
    },
    {
        id: 8,
        image: ninhThuan,
        title: "Tour Vĩnh Hy - Ninh Thuận 3 ngày 2 đêm từ TP.HCM",
        location: "Hồ Chí Minh",
        duration: "3 ngày 2 đêm",
        schedule: "Thứ 6 hàng tuần",
        price: 3380000,
        oldPrice: 4056000,
        promotions: ["Khuyến mãi Đặt xa", "Khuyến mãi cho Khách hàng thân thiết", "Khuyến mãi Đặt theo Nhóm", "Khuyến mãi cho Người Cao tuổi"],
    },
    {
        id: 9,
        image: ninhThuan,
        title: "Tour Vĩnh Hy - Ninh Thuận 3 ngày 2 đêm từ TP.HCM",
        location: "Hồ Chí Minh",
        duration: "3 ngày 2 đêm",
        schedule: "Thứ 6 hàng tuần",
        price: 3380000,
        oldPrice: 4056000,
        promotions: ["Khuyến mãi Đặt xa", "Khuyến mãi cho Khách hàng thân thiết", "Khuyến mãi Đặt theo Nhóm", "Khuyến mãi cho Người Cao tuổi"],
    },
    {
        id: 10,
        image: ninhThuan,
        title: "Tour Vĩnh Hy - Ninh Thuận 3 ngày 2 đêm từ TP.HCM",
        location: "Hồ Chí Minh",
        duration: "3 ngày 2 đêm",
        schedule: "Thứ 6 hàng tuần",
        price: 3380000,
        oldPrice: 4056000,
        promotions: ["Khuyến mãi Đặt xa", "Khuyến mãi cho Khách hàng thân thiết", "Khuyến mãi Đặt theo Nhóm", "Khuyến mãi cho Người Cao tuổi"],
    },
    {
        id: 11,
        image: ninhThuan,
        title: "Tour Vĩnh Hy - Ninh Thuận 3 ngày 2 đêm từ TP.HCM",
        location: "Hồ Chí Minh",
        duration: "3 ngày 2 đêm",
        schedule: "Thứ 6 hàng tuần",
        price: 3380000,
        oldPrice: 4056000,
        promotions: ["Khuyến mãi Đặt xa", "Khuyến mãi cho Khách hàng thân thiết", "Khuyến mãi Đặt theo Nhóm", "Khuyến mãi cho Người Cao tuổi"],
    },
    {
        id: 12,
        image: ninhThuan,
        title: "Tour Vĩnh Hy - Ninh Thuận 3 ngày 2 đêm từ TP.HCM",
        location: "Hồ Chí Minh",
        duration: "3 ngày 2 đêm",
        schedule: "Thứ 6 hàng tuần",
        price: 3380000,
        oldPrice: 4056000,
        promotions: ["Khuyến mãi Đặt xa", "Khuyến mãi cho Khách hàng thân thiết", "Khuyến mãi Đặt theo Nhóm", "Khuyến mãi cho Người Cao tuổi"],
    },
    // Thêm các tour khác tương tự...
];

const Tours = () => {
    const [tours, setTours] = useState([]);
    const [visibleCount, setVisibleCount] = useState(6); // Hiển thị 6 tour đầu tiên

    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);

        // Gọi API thực tế ở đây, tạm thời dùng mock data
        setTours(mockTours);
    }, []);

    const handleShowMore = () => {
        setVisibleCount((prev) => prev + 6); // Mỗi lần nhấn hiện thêm 6 tour
    };

    return (
        <div id="tour-list">
            <div className="tour-list-container">
                <div className="tour-list-header">
                    <p className="breadcrumb">
                        <Link to="/" className="breadcrumb-text">
                            Trang chủ
                        </Link>
                        <span>/</span>
                        <span>Tour Trong Nước</span>
                    </p>
                    <h1>
                        Tour Du Lịch Trong Nước
                        <div className="section-underline"></div>
                    </h1>

                    <p className="tour-list-desc">Bạn tìm tour du lịch trong nước, du lịch ngắn ngày dành cho gia đình, công ty hay đi cùng bạn bè. Hãy đến với DTravel để có những lựa chọn hoàn hảo nhất. Tự hào là nhà tổ chức tour uy tín hàng đầu.</p>
                </div>
                <div className="tour-list-content">
                    <div className="tour-list-main">
                        {tours.slice(0, visibleCount).map((tour) => (
                            <Link to={`/tours/${tour.id}`} key={tour.id} className="tour-card-link">
                                <div className="tour-card" key={tour.id}>
                                    <img src={tour.image} alt={tour.title} className="tour-card-img" />
                                    <div className="tour-card-info-container">
                                        <h2 className="tour-card-title">{tour.title}</h2>
                                        <div className="tour-card-info-wrap">
                                            <div className="tour-card-info">
                                                <span>
                                                    <i className="fa-solid fa-house"></i>Điểm khởi hành: {tour.location}
                                                </span>
                                                <br />
                                                <span>
                                                    <i className="fa-solid fa-clock"></i>Thời gian: {tour.duration}
                                                </span>
                                                <br />
                                                <span>
                                                    <i className="fa-solid fa-calendar-days"></i>Khởi hành: {tour.schedule}
                                                </span>
                                                <div className="section-info-underline"></div>
                                            </div>
                                            <div className="tour-card-price">
                                                <span className="price">{tour.price.toLocaleString()}đ</span>
                                                <span className="old-price">{tour.oldPrice.toLocaleString()}đ</span>
                                                <Link to={`/tours/${tour.id}`} className="tour-card-detail-btn">
                                                    Xem chi tiết
                                                </Link>
                                            </div>
                                        </div>
                                        <ul className="tour-card-promotions">
                                            {tour.promotions.map((promo, idx) => (
                                                <li key={idx}>{promo}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {visibleCount < tours.length && (
                            <div className="show-more-container">
                                <div className="show-more-btn" onClick={handleShowMore}>
                                    <span>
                                        <i className="fa-solid fa-chevron-down"></i> Xem thêm ({tours.length - visibleCount})
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="tour-sidebar">
                        {/* Filter */}
                        <div className="tour-filter">
                            <div className="tour-filter-title">
                                Lọc và sắp xếp
                                <div className="tour-filter-underline"></div>
                            </div>
                            <div className="tour-filter-group">
                                <label>Điểm xuất phát</label>
                                <select>
                                    <option>Tất cả</option>
                                    <option>Hà Nội</option>
                                    <option>Hồ Chí Minh</option>
                                    {/* ... */}
                                </select>
                            </div>
                            <div className="tour-filter-group">
                                <label>Thời gian tour (ngày)</label>
                                <input type="number" placeholder="Nhập số ngày" />
                            </div>
                            <div className="tour-filter-group">
                                <label>Mức giá</label>
                                <input type="number" placeholder="Từ giá, ví dụ: 3.000.000" />
                                <label>đến</label>
                                <input type="number" placeholder="Đến giá, ví dụ: 10.000.000" style={{marginTop: 4}} />
                            </div>
                            <div className="tour-filter-group">
                                <label>Sắp xếp theo</label>
                                <select>
                                    <option>DTravel gợi ý</option>
                                    <option>Giá tăng dần</option>
                                    <option>Giá giảm dần</option>
                                    <option>Thời lượng tour tăng dần</option>
                                    <option>Thời lượng tour giảm dần</option>
                                </select>
                            </div>
                            <button className="tour-filter-apply">Áp dụng</button>
                        </div>

                        {/* Danh mục */}
                        <div className="tour-category">
                            <div className="tour-category-title">
                                Danh mục
                                <div className="tour-category-underline"></div>
                            </div>
                            <ul>
                                <li>
                                    Tour Miền Bắc <i className="fa-solid fa-caret-right"></i>
                                </li>
                                <li>
                                    Tour Miền Nam <i className="fa-solid fa-caret-right"></i>
                                </li>
                                <li>
                                    Tour Miền Trung <i className="fa-solid fa-caret-right"></i>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tours;

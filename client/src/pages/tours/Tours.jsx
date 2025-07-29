import React, {useState, useEffect} from "react";
import {Link, useSearchParams} from "react-router-dom";
import "./Tours.css"; // Tạo file css này để style
import ninhThuan from "../../assets/ninh_thuan.webp";
import {getRatingLabel} from "../../utils/ratingUtils";
import axios from "axios";

const Tours = () => {
    const [tours, setTours] = useState([]);
    const [visibleCount, setVisibleCount] = useState(10); // Hiển thị 10 tour đầu tiên

    const [searchParams] = useSearchParams(); // Lấy các tham số tìm kiếm từ URL
    const locationId = searchParams.get("location_id"); // Ví dụ: lấy location_id từ URL
    const subregionId = searchParams.get("subregion_id"); // Ví dụ: lấy subregion_id từ URL
    const regionId = searchParams.get("region_id"); // Ví dụ: lấy region_id từ URL
    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);

        const fetchTours = async () => {
            try {
                const response = await axios.get("http://localhost:3000/api/tours", {
                    params: {regionId, subregionId, locationId},
                });
                console.log("Lấy danh sách tour từ API:", response);

                setTours(response.data.result || []); // Giả sử API trả về danh sách tour trong trường result
                console.log("Danh sách tour:", response.data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách tour:", error);
            }
        };
        fetchTours();
        // Gọi API thực tế ở đây, tạm thời dùng mock data
        // setTours(mockTours);
    }, [regionId, subregionId, locationId]);

    const handleShowMore = () => {
        setVisibleCount((prev) => prev + 10); // Mỗi lần nhấn hiện thêm 10 tour
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
                            <Link to={`/tours/${tour.id}`} className="tour-card-row" key={tour.id}>
                                <img src={tour.image_url} alt={tour.title} className="tour-card-row-img" />
                                <div className="tour-card-row-content">
                                    <div className="tour-card-row-header">
                                        <span className="tour-card-row-title">{tour.title}</span>
                                    </div>

                                    <div className="tour-card-row-rating">
                                        <span className="tour-card-row-rating-badge">{tour.rating}</span>
                                        <span className="tour-card-row-rating-text">{getRatingLabel(tour.rating)}</span>
                                        <span className="tour-card-row-rating-count">| {tour.rating_count} đánh giá</span>
                                    </div>

                                    <div className="tour-card-row-info">
                                        <div>
                                            <i className="fa-solid fa-house"></i>
                                            <span>Điểm khởi hành: {tour.location_name}</span>
                                        </div>
                                        <div>
                                            <i className="fa-regular fa-clock"></i>
                                            <span>
                                                Thời gian: {tour.num_day} ngày {tour.num_night} đêm
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="tour-card-row-pricebox">
                                    <span className="tour-card-row-date">
                                        <i className="fa-regular fa-calendar"></i>
                                        {tour.departure_date}
                                    </span>
                                    <div className="tour-card-row-oldprice">{tour.old_price} đ</div>
                                    <div className="tour-card-row-price">{tour.price} đ</div>
                                    <div className="tour-card-row-btn">
                                        Xem Tour <i className="fa-solid fa-chevron-right"></i>
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

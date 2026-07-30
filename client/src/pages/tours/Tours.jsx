import React, {useState, useEffect} from "react";
import {Link, useSearchParams} from "react-router-dom";
import "./Tours.css"; // Tạo file css này để style
import {getRatingLabel} from "../../utils/ratingUtils";
import axios from "axios";
import Pagination from "../../components/pagination/Pagination";

const Tours = () => {
    const [tours, setTours] = useState([]);
    const [pagination, setPagination] = useState({totalItems: 0, totalPages: 1, currentPage: 1, totalItemsPerPage: 10});
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState({
        departure: "",
        duration: "",
        priceFrom: "",
        priceTo: "",
        sortBy: "",
    });

    const [searchParams, setSearchParams] = useSearchParams(); // Lấy các tham số tìm kiếm từ URL
    const locationId = searchParams.get("location_id"); // Ví dụ: lấy location_id từ URL
    const subregionId = searchParams.get("subregion_id"); // Ví dụ: lấy subregion_id từ URL
    const regionId = searchParams.get("region_id"); // Ví dụ: lấy region_id từ URL
    const page = parseInt(searchParams.get("page") || "1", 10);
    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchTours = async () => {
            try {
                setIsLoading(true);
                setTours([]);
                let response;

                const API_BASE = import.meta.env.VITE_API_BASE || "";
                if (searchParams.get("destination") || searchParams.get("startDate") || searchParams.get("departure")) {
                    // 🔍 Nếu có tham số search thì gọi API search
                    response = await axios.get(`${API_BASE}/api/tours/search`, {
                        params: {
                            destination: searchParams.get("destination"),
                            startDate: searchParams.get("startDate"),
                            departure: searchParams.get("departure"),
                            page,
                            limit: itemsPerPage,
                        },
                    });
                } else {
                    // 🌍 Nếu chỉ filter theo khu vực thì gọi API tours bình thường
                    response = await axios.get(`${API_BASE}/api/tours`, {
                        params: {
                            regionId: searchParams.get("region_id"),
                            subregionId: searchParams.get("subregion_id"),
                            locationId: searchParams.get("location_id"),
                            page,
                            limit: itemsPerPage,
                            departure: searchParams.get("departure"),
                            duration: searchParams.get("duration"),
                            priceFrom: searchParams.get("priceFrom"),
                            priceTo: searchParams.get("priceTo"),
                            sortBy: searchParams.get("sortBy"),
                        },
                    });
                }

                setTours(response.data.result || []);
                if (response.data.pagination) {
                    setPagination(response.data.pagination);
                    if (typeof response.data.pagination.totalItemsPerPage === "number") {
                        setItemsPerPage(response.data.pagination.totalItemsPerPage);
                    }
                } else {
                    setPagination({totalItems: (response.data.result || []).length, totalPages: 1, currentPage: 1, totalItemsPerPage: itemsPerPage});
                }
                console.log("✅ Danh sách tour:", response.data);
            } catch (error) {
                console.error("❌ Lỗi khi lấy danh sách tour:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTours();
    }, [searchParams]);

    const handlePageChange = (newPage) => {
        const next = new URLSearchParams(searchParams);
        next.set("page", String(newPage));
        setSearchParams(next);
        window.scrollTo({top: 0, behavior: "smooth"});
    };

    const handleFilterChange = (e) => {
        const {name, value} = e.target;
        setFilter((prev) => ({...prev, [name]: value}));
    };

    const handleApplyFilter = () => {
        const next = new URLSearchParams(searchParams);
        // Ép kiểu về số khi set giá trị filter
        if (filter.departure) next.set("departure", filter.departure);
        else next.delete("departure");
        if (filter.duration) next.set("duration", String(Number(filter.duration)));
        else next.delete("duration");
        if (filter.priceFrom) next.set("priceFrom", String(Number(filter.priceFrom)));
        else next.delete("priceFrom");
        if (filter.priceTo) next.set("priceTo", String(Number(filter.priceTo)));
        else next.delete("priceTo");
        if (filter.sortBy) next.set("sortBy", filter.sortBy);
        else next.delete("sortBy");
        next.set("page", "1"); // reset page
        setSearchParams(next);
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
                    {searchParams.get("destination") || searchParams.get("departure") || searchParams.get("startDate") ? (
                        <>
                            <h1 className="tour-list-title">
                                Kết quả tìm kiếm cho
                                {searchParams.get("destination") ? ` "${searchParams.get("destination")}"` : ""}
                                {searchParams.get("departure") ? ` từ "${searchParams.get("departure")}"` : ""}
                            </h1>
                            <p className="tour-list-summary">Tổng cộng {pagination.totalItems} tour</p>
                        </>
                    ) : (
                        <>
                            <h1 className="tour-list-title">Tour Du Lịch Trong Nước</h1>
                            <p className="tour-list-summary">Tổng cộng {pagination.totalItems} tour</p>
                        </>
                    )}
                </div>
                <div className="tour-list-content">
                    <div className="tour-list-main">
                        {isLoading && (
                            <>
                                {Array.from({length: itemsPerPage}).map((_, idx) => (
                                    <div className="tour-card-row skeleton-row" key={`sk-${idx}`}>
                                        <div className="skeleton-img"></div>
                                        <div className="tour-card-row-content">
                                            <div className="skeleton-line skeleton-title"></div>
                                            <div className="skeleton-line"></div>
                                            <div className="skeleton-line short"></div>
                                        </div>
                                        <div className="tour-card-row-pricebox">
                                            <div className="skeleton-badge"></div>
                                            <div className="skeleton-line price"></div>
                                            <div className="skeleton-btn"></div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                        {!isLoading &&
                            tours.map((tour) => (
                                <Link to={`/tours/${tour.id}`} className="tour-card-row" key={tour.id}>
                                    <img 
                                        src={tour.thumbnail_url?.startsWith('/') ? (import.meta.env.VITE_API_BASE + tour.thumbnail_url) : tour.thumbnail_url} 
                                        alt={tour.title} 
                                        className="tour-card-row-img" 
                                    />
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
                                                <span>Địa điểm: {tour.location_name}</span>
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

                        <div style={{display: "flex", justifyContent: "center", marginTop: 16}}>
                            <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
                        </div>
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
                                <select name="departure" value={filter.departure} onChange={handleFilterChange}>
                                    <option value="">Tất cả</option>
                                    <option value="Hà Nội">Hà Nội</option>
                                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                                    {/* ... */}
                                </select>
                            </div>
                            <div className="tour-filter-group">
                                <label>Thời gian tour (ngày)</label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={filter.duration}
                                    onChange={handleFilterChange}
                                    placeholder="Nhập số ngày"
                                />
                            </div>
                            <div className="tour-filter-group">
                                <label>Mức giá</label>
                                <input
                                    type="number"
                                    name="priceFrom"
                                    value={filter.priceFrom}
                                    onChange={handleFilterChange}
                                    placeholder="Từ giá, ví dụ: 3.000.000"
                                />
                                <label>đến</label>
                                <input
                                    type="number"
                                    name="priceTo"
                                    value={filter.priceTo}
                                    onChange={handleFilterChange}
                                    placeholder="Đến giá, ví dụ: 10.000.000"
                                    style={{marginTop: 4}}
                                />
                            </div>
                            <div className="tour-filter-group">
                                <label>Sắp xếp theo</label>
                                <select name="sortBy" value={filter.sortBy} onChange={handleFilterChange}>
                                    <option value="">DTravel gợi ý</option>
                                    <option value="priceAsc">Giá tăng dần</option>
                                    <option value="priceDesc">Giá giảm dần</option>
                                    <option value="durationAsc">Thời lượng tour tăng dần</option>
                                    <option value="durationDesc">Thời lượng tour giảm dần</option>
                                </select>
                            </div>
                            <button className="tour-filter-apply" onClick={handleApplyFilter}>
                                Áp dụng
                            </button>
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

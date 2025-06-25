import React, {useState, useRef, useEffect} from "react";
import {useParams} from "react-router-dom"; // để lấy id từ URL
import "./TourDetail.css";
import detail1 from "../../assets/detail1.webp";
import detail2 from "../../assets/detail2.webp";
import detail3 from "../../assets/detail3.webp";
import detail4 from "../../assets/detail4.webp";
import detail5 from "../../assets/detail5.webp";
import detail6 from "../../assets/detail6.webp";
import detail7 from "../../assets/detail7.webp";
import haGiang from "../../assets/ha_giang.webp";
import haLong from "../../assets/ha_long.webp";
import hoBaBe from "../../assets/ho_ba_be.webp";
import daNang from "../../assets/da_nang.webp";
import ninhThuan from "../../assets/ninh_thuan.webp";
import mienTay from "../../assets/mien_tay.webp";
import TourCategory from "../../components/tourCategory/TourCategory";
import VietnamGrid from "../../components/vietNam/VietnamGrid";
import {useNavigate} from "react-router-dom";
import {getRatingLabel} from "../../utils/ratingUtils";
import Calendar from "../../components/calendar/Calendar";
import axios from "axios";

// Dữ liệu cho Khám phá Việt Nam
const vietnamDestinations = [
    {title: "Hà Giang", image: haGiang, className: "ha-giang"},
    {title: "Hạ Long", image: haLong, className: "ha-long"},
    {title: "Hồ Ba Bể - Thác Bản Giốc", image: hoBaBe, className: "ho-ba-be"},
    {title: "Đà Nẵng", image: daNang, className: "da-nang"},
    {title: "Ninh Thuận", image: ninhThuan, className: "ninh-thuan"},
    {title: "Miền Tây", image: mienTay, className: "mien-tay"},
];

const domesticTours = [
    {
        id: 1,
        title: "Tour Y Tý - Bắc Hà 3 ngày 2 đêm từ Hà Nội - Nghỉ lễ 30/4 - 1/5",
        image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        duration: "3 ngày 2 đêm",
        location: "Hà Nội, Sapa",
        rating: 4.8,
        booked: 320,
        oldPrice: "2.800.000",
        price: "2.500.000",
    },
    {
        id: 2,
        title: "Tour Y Tý - Bắc Hà 3 ngày 2 đêm từ Hà Nội - Nghỉ lễ 30/4 - 1/5",
        image: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        duration: "4 ngày 3 đêm",
        location: "Đà Nẵng, Hội An",
        rating: 4.7,
        booked: 410,
        oldPrice: "3.800.000",
        price: "3.500.000",
    },
    {
        id: 3,
        title: "Tour Y Tý - Bắc Hà 3 ngày 2 đêm từ Hà Nội - Nghỉ lễ 30/4 - 1/5",
        image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        duration: "5 ngày 4 đêm",
        location: "Nha Trang, Đà Lạt",
        rating: 4.9,
        booked: 500,
        oldPrice: "4.600.000",
        price: "4.200.000",
    },
    {
        id: 4,
        title: "Tour Y Tý - Bắc Hà 3 ngày 2 đêm từ Hà Nội - Nghỉ lễ 30/4 - 1/5",
        image: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        duration: "4 ngày 3 đêm",
        location: "Đà Nẵng, Hội An",
        rating: 4.7,
        booked: 410,
        oldPrice: "3.800.000",
        price: "3.500.000",
    },
    {
        id: 5,
        title: "Tour Y Tý - Bắc Hà 3 ngày 2 đêm từ Hà Nội - Nghỉ lễ 30/4 - 1/5",
        image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        duration: "5 ngày 4 đêm",
        location: "Nha Trang, Đà Lạt",
        rating: 4.9,
        booked: 500,
        oldPrice: "4.600.000",
        price: "4.200.000",
    },
    {
        id: 6,
        title: "Tour Y Tý - Bắc Hà 3 ngày 2 đêm từ Hà Nội - Nghỉ lễ 30/4 - 1/5",
        image: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        duration: "4 ngày 3 đêm",
        location: "Đà Nẵng, Hội An",
        rating: 4.7,
        booked: 410,
        oldPrice: "3.800.000",
        price: "3.500.000",
    },
    {
        id: 7,
        title: "Tour Y Tý - Bắc Hà 3 ngày 2 đêm từ Hà Nội - Nghỉ lễ 30/4 - 1/5",
        image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        duration: "5 ngày 4 đêm",
        location: "Nha Trang, Đà Lạt",
        rating: 4.9,
        booked: 500,
        oldPrice: "4.600.000",
        price: "4.200.000",
    },
    {
        id: 8,
        title: "Tour Y Tý - Bắc Hà 3 ngày 2 đêm từ Hà Nội - Nghỉ lễ 30/4 - 1/5",
        image: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        duration: "4 ngày 3 đêm",
        location: "Đà Nẵng, Hội An",
        rating: 4.7,
        booked: 410,
        oldPrice: "3.800.000",
        price: "3.500.000",
    },
    {
        id: 9,
        title: "Tour Y Tý - Bắc Hà 3 ngày 2 đêm từ Hà Nội - Nghỉ lễ 30/4 - 1/5",
        image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        duration: "5 ngày 4 đêm",
        location: "Nha Trang, Đà Lạt",
        rating: 4.9,
        booked: 500,
        oldPrice: "4.600.000",
        price: "4.200.000",
    },
    {
        id: 10,
        title: "Tour Y Tý - Bắc Hà 3 ngày 2 đêm từ Hà Nội - Nghỉ lễ 30/4 - 1/5",
        image: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        duration: "4 ngày 3 đêm",
        location: "Đà Nẵng, Hội An",
        rating: 4.7,
        booked: 410,
        oldPrice: "3.800.000",
        price: "3.500.000",
    },
];

const tabSections = [
    {label: "Tổng quan", key: "intro", id: "tour-intro-section"},
    {label: "Chương trình tour", key: "itinerary", id: "tour-itinerary-section"},
    {label: "Lịch khởi hành", key: "departure", id: "tour-departure-section"},
    {label: "Thông tin cần lưu ý", key: "terms", id: "tour-terms-section"},
    {label: "Đánh giá tour", key: "reviews", id: "tour-reviews-section"},
];

export default function TourDetail() {
    const [mainImgIdx, setMainImgIdx] = useState(0);
    const [activeTab, setActiveTab] = useState(tabSections[0].key);
    const [showFullIntro, setShowFullIntro] = useState(false); // Trạng thái hiển thị nội dung đầy đủ
    const [showSeeMore, setShowSeeMore] = useState(false); // Trạng thái hiển thị nút "Xem thêm"
    const [infoTab, setInfoTab] = useState("included");
    const [selectedDate, setSelectedDate] = useState("13/06"); // State cho ngày đang chọn
    const introRef = useRef(null); // Ref cho phần nội dung
    const seeMoreRef = useRef(null); // Ref cho nút "Xem thêm"
    const seeMorePositionRef = useRef(null); // Ref lưu vị trí của nút
    const [showCalendar, setShowCalendar] = useState(false); // Trạng thái hiển thị lịch
    const calendarRef = useRef(null); // Ref cho vùng calendar
    const navigate = useNavigate();
    const buttonRef = useRef(null); // ⬅️ thêm ref cho nút
    const tourMainRightRef = useRef(null);
    const reviewsSectionRef = useRef(null);
    const [isStickyStopped, setIsStickyStopped] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null);
    const [showAll, setShowAll] = useState(false);

    // state cho dữ liệu tour, lịch khởi hành, giá, overview và schedules, reviews
    const [tour, setTour] = useState({});
    const [departures, setDepartures] = useState([]);
    const [prices, setPrices] = useState([]);
    const [overview, setOverview] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [terms, setTerms] = useState([]);

    const {id} = useParams(); // giả sử route là /tour/:id

    const infoTabs = [
        {label: "Giá bao gồm", key: "included", content: terms?.included},
        {label: "Giá không bao gồm", key: "excluded", content: terms?.excluded},
        {label: "Phụ thu", key: "surcharge", content: terms?.surcharge},
        {label: "Hủy đổi", key: "cancel", content: terms?.cancelPolicy},
        {label: "Lưu ý", key: "note", content: terms?.notes},
        {label: "Hướng dẫn viên", key: "guide", content: terms?.guideInfo},
    ];
    useEffect(() => {
        const fetchData = async () => {
            try {
                const responses = await axios.all([axios.get(`http://localhost:3000/api/tours/${id}`), axios.get(`http://localhost:3000/api/tours/${id}/departures`), axios.get(`http://localhost:3000/api/tours/${id}/prices`), axios.get(`http://localhost:3000/api/tours/${id}/overview`), axios.get(`http://localhost:3000/api/tours/${id}/schedules`), axios.get(`http://localhost:3000/api/tours/${id}/reviews`), axios.get(`http://localhost:3000/api/tours/${id}/terms`)]);

                const [tourRes, depRes, priceRes, overviewRes, scheduleRes, reviewRes, termsRes] = responses;

                setTour(tourRes.data);
                setDepartures(depRes.data);
                setPrices(priceRes.data);
                setOverview(overviewRes.data);
                setSchedules(scheduleRes.data);
                setReviews(reviewRes.data);
                setTerms(termsRes.data);
            } catch (error) {
                console.error("Lỗi khi fetch tour details:", error);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        if (introRef.current && introRef.current.scrollHeight > 300) {
            setShowSeeMore(true);
        }
    }, []);

    useEffect(() => {
        if (!showFullIntro && seeMoreRef.current) {
            seeMoreRef.current.scrollIntoView({behavior: "smooth", block: "start"});
        }
    }, [showFullIntro]);

    // Đóng khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                calendarRef.current &&
                !calendarRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target) // ⬅️ Đừng quên nút cũng cần check
            ) {
                setShowCalendar(false);
            }
        };
        if (showCalendar) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showCalendar]);

    useEffect(() => {
        const handleScroll = () => {
            if (!tourMainRightRef.current || !reviewsSectionRef.current) return;
            const rightBox = tourMainRightRef.current.getBoundingClientRect();
            const reviews = reviewsSectionRef.current.getBoundingClientRect();
            // Nếu bottom của box chạm top của reviews section thì dừng sticky
            if (rightBox.bottom > reviews.top) {
                setIsStickyStopped(true);
            } else {
                setIsStickyStopped(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const prevImg = () => setMainImgIdx((prev) => (prev === 0 ? tour.images.length - 1 : prev - 1));
    const nextImg = () => setMainImgIdx((prev) => (prev === tour.images.length - 1 ? 0 : prev + 1));

    const getVisibleThumbnails = () => {
        if (!tour.images || !Array.isArray(tour.images) || tour.images.length === 0) return [];
        const total = tour.images.length;
        const thumbnails = [];
        for (let i = 0; i < 4; i++) {
            thumbnails.push(tour.images[(mainImgIdx + i) % total]);
        }
        return thumbnails;
    };

    const handleTabClick = (id, key) => {
        setActiveTab(key);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({behavior: "smooth", block: "start"});
        }
    };

    const handleExpand = () => {
        if (seeMoreRef.current) {
            // Lưu vị trí theo đơn vị pixel so với viewport
            const rect = seeMoreRef.current.getBoundingClientRect();
            seeMorePositionRef.current = window.scrollY + rect.top;
        }
        setShowFullIntro(true);
    };

    const handleCollapse = () => {
        setShowFullIntro(false);

        // Đợi nội dung co lại rồi scroll
        setTimeout(() => {
            if (seeMoreRef.current) {
                seeMoreRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }, 100);
    };

    const toggleContent = (index) => {
        if (showAll) return; // Nếu đang "xem tất cả", thì bỏ qua toggle từng item
        setActiveIndex(activeIndex === index ? null : index);
    };

    const handleToggleAll = () => {
        setShowAll(!showAll);
        setActiveIndex(null); // Reset toggle từng ngày nếu chuyển sang chế độ xem tất cả
    };

    // Lấy giá và độ tuổi từng loại khách từ prices
    const getPriceByType = (type) => {
        const found = prices.find((p) => p.target_type === type);
        return found ? found.price : 0;
    };
    const getAgeRange = (type) => {
        const found = prices.find((p) => p.target_type === type);
        if (!found) return "";
        if (type === "adult") {
            return `> ${found.min_age} tuổi`;
        }
        return `${found.min_age} - ${found.max_age} tuổi`;
    };

    // State cho số lượng khách từng loại
    const [guestCounts, setGuestCounts] = useState({
        adult: 1,
        child58: 0,
        child24: 0,
        infant: 0,
    });

    // Hàm tăng/giảm số lượng khách
    const handleGuestChange = (type, delta) => {
        setGuestCounts((prev) => {
            let min = 0;
            if (type === "adult") min = 1;
            const next = {...prev, [type]: Math.max(min, prev[type] + delta)};
            return next;
        });
    };

    // Giá từng loại khách
    const PRICE_ADULT = 3110000;
    const PRICE_CHILD_58 = 3110000;
    const PRICE_CHILD_24 = 3110000;
    const PRICE_INFANT = 0;

    // Tính tổng tiền
    const totalPrice =
        guestCounts.adult * getPriceByType("adult") +
        guestCounts.child58 * getPriceByType("child") +
        guestCounts.child24 * getPriceByType("child") + // Nếu có loại child24 riêng thì sửa lại
        guestCounts.infant * getPriceByType("infant");

    return (
        <div className="tour-detail-container">
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <a href="/">
                    <i className="fa fa-house"></i>
                </a>
                <span> &gt; </span>
                <a href="/">Du lịch trong nước</a>
                <span> &gt; </span>
                <span>{tour.title}</span>
            </div>

            <div className="tour-header">
                <h1 className="tour-title">{tour.title}</h1>
                <div className="tour-card-row-rating" title="Click để xem đánh giá" onClick={() => handleTabClick("tour-reviews-section", "reviews")} style={{cursor: "pointer"}}>
                    <span className="tour-card-row-rating-badge">{tour.rating}</span>
                    <span className="tour-card-row-rating-text">{getRatingLabel(tour.rating)}</span>
                    <span className="tour-card-row-rating-count">| {tour.ratingCount} đánh giá</span>
                    <i className="fa-solid fa-angle-down"></i>
                </div>
            </div>
            {/* Main content */}
            <div className="tour-main" style={{position: "relative"}}>
                {/* Left: Images & Info */}

                <div className="tour-main-left">
                    {/* Slider ảnh lớn */}
                    <div className="tour-main-img-slider">
                        <div className="img-nav-btn left" onClick={prevImg}>
                            <i className="fa-solid fa-chevron-left"></i>
                        </div>
                        {tour.images && tour.images.length > 0 ? <img src={tour.images[mainImgIdx].image_url} alt="main" /> : <div style={{width: 400, height: 250, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center"}}>Không có ảnh</div>}
                        <div className="img-nav-btn right" onClick={nextImg}>
                            <i className="fa-solid fa-chevron-right"></i>
                        </div>
                    </div>
                    {/* Thumbnails */}
                    <div className="tour-main-thumbs">
                        {getVisibleThumbnails().map((img, i) => {
                            const realIdx = (mainImgIdx + i) % tour.images.length;
                            return <img key={img.image_url || realIdx} src={img.image_url} alt={`thumb-${realIdx}`} className={mainImgIdx === realIdx ? "active" : ""} onClick={() => setMainImgIdx(realIdx)} />;
                        })}
                    </div>

                    {/* Thông tin khởi hành, mã tour, bao gồm */}
                    <div className="tour-main-summary">
                        <div className="tour-main-summary-row">
                            <div>
                                <i className="fa fa-location-dot tour-main-summary-icons"></i>
                                <span>
                                    Khởi hành từ: <b>{tour.location_name}</b>
                                </span>
                            </div>
                            <div>
                                <i className="fa fa-bus tour-main-summary-icons"></i>
                                <i className="fa fa-user"></i>
                            </div>
                            <div>
                                Mã Tour: <b>TO1231</b>
                            </div>
                        </div>
                        <div>
                            <h3 className="tour-main-summary-title">Tour Trọn Gói bao gồm</h3>
                            <div className="tour-main-summary-list">
                                <ul>
                                    <li>
                                        <i className="fa fa-check"></i>Khách sạn 2*
                                    </li>
                                    <li>
                                        <i className="fa fa-check"></i>Vé tham quan
                                    </li>
                                </ul>
                                <ul>
                                    <li>
                                        <i className="fa fa-check"></i>Bữa ăn
                                    </li>
                                    <li>
                                        <i className="fa fa-check"></i>Hướng dẫn viên
                                    </li>
                                </ul>
                                <ul>
                                    <li>
                                        <i className="fa fa-check"></i>Xe tham quan
                                    </li>
                                    <li>
                                        <i className="fa fa-check"></i>Bảo hiểm du lịch
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="tour-main-tabs">
                        {tabSections.map((t) => (
                            <button key={t.key} className={"tour-main-tab-btn" + (activeTab === t.key ? " active" : "")} onClick={() => handleTabClick(t.id, t.key)}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <div className="tour-main-tab-content">
                        <div id="tour-intro-section" style={{scrollMarginTop: 120, position: "relative"}}>
                            <h2>Trải nghiệm thú vị trong tour</h2>
                            <div
                                ref={introRef}
                                className={`tour-intro-content${showFullIntro ? " expanded" : ""}`}
                                style={{
                                    maxHeight: showFullIntro ? "none" : 300,
                                    overflow: showFullIntro ? "visible" : "hidden",
                                    position: "relative",
                                    transition: "max-height 0.3s",
                                }}
                                dangerouslySetInnerHTML={overview && overview.content ? {__html: overview.content} : undefined}
                            ></div>
                        </div>
                        <div id="tour-itinerary-section" style={{scrollMarginTop: 120, marginTop: 40}}>
                            <div className="tour-program-header">
                                <h2>Chương trình tour</h2>
                                <span className="tour-program-seeall" onClick={handleToggleAll}>
                                    {showAll ? "Thu gọn" : "Xem tất cả"}
                                </span>
                            </div>
                            <div className="tour-program-list">
                                {schedules && schedules.length > 0 ? (
                                    schedules.map((item, idx) => (
                                        <div className="tour-program-item" key={idx}>
                                            <div
                                                className="tour-program-item-header"
                                                onClick={() => toggleContent(idx)}
                                                style={{cursor: showAll ? "default" : "pointer"}} // Vô hiệu hóa click nếu đang "xem tất cả"
                                            >
                                                <div className="tour-program-info">
                                                    <div className="tour-program-day">{item.day_text}</div>
                                                    <div className="tour-program-title">{item.title}</div>
                                                </div>
                                                <i className={`fa-solid ${showAll || activeIndex === idx ? "fa-angle-up" : "fa-angle-down"}`}></i>
                                            </div>
                                            <div className={`tour-program-content ${showAll || activeIndex === idx ? "open" : ""}`}>
                                                <div className="tour-program-inner" dangerouslySetInnerHTML={{__html: item.content}} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div>Không có dữ liệu lịch trình</div>
                                )}
                            </div>
                        </div>

                        {/* Lịch khởi hành & giá tour */}
                        <div id="tour-departure-section" style={{scrollMarginTop: 120, marginTop: 40}}>
                            <div style={{display: "flex", alignItems: "center", gap: 16, marginBottom: 16, justifyContent: "space-between"}}>
                                <h2 style={{margin: 0}}>Lịch khởi hành & giá tour</h2>
                                <div style={{display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: 6, padding: "4px 10px", background: "#fff"}}>
                                    <i className="fa-regular fa-calendar" style={{marginRight: 6, color: "#1f50ea"}}></i>
                                    <input
                                        type="date"
                                        style={{
                                            border: "none",
                                            outline: "none",
                                            fontSize: 15,
                                            background: "transparent",
                                            color: "#222",
                                            minWidth: 120,
                                            cursor: "pointer",
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="departure-table-wrapper" style={{background: "#fff", borderRadius: 8, border: "1px solid #eee", marginBottom: 32}}>
                                <table className="departure-table" style={{width: "100%", borderCollapse: "collapse"}}>
                                    <thead>
                                        <tr style={{background: "#f7f7f7"}}>
                                            <th style={{padding: 8, fontWeight: 600}}>Ngày khởi hành</th>
                                            <th style={{padding: 8, fontWeight: 600}}>Ngày về</th>
                                            <th style={{padding: 8, fontWeight: 600}}>Tình trạng chỗ</th>
                                            <th style={{padding: 8, fontWeight: 600}}>Giá</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {departures && departures.length > 0 ? (
                                            departures.map((item) => (
                                                <tr key={item.id} style={{borderBottom: "1px solid #eee"}}>
                                                    <td style={{padding: 8}}>{new Date(item.departure_date).toLocaleDateString("vi-VN")}</td>
                                                    <td style={{padding: 8}}>{new Date(item.return_date).toLocaleDateString("vi-VN")}</td>
                                                    <td style={{padding: 8, color: "#219653", fontWeight: 500}}>{item.seat_status}</td>
                                                    <td style={{padding: 8, color: "#1f50ea", fontWeight: 600}}>
                                                        {item.price.toLocaleString()} <span style={{color: "#333", fontWeight: 400}}>đ</span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} style={{textAlign: "center", padding: 16}}>
                                                    Không có dữ liệu lịch khởi hành
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <div style={{textAlign: "center", padding: 12}}>
                                    <span style={{color: "#1f50ea", cursor: "pointer", fontWeight: 500}}>
                                        Xem thêm <i className="fa-solid fa-chevron-down" style={{fontSize: 12}}></i>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div id="tour-terms-section" style={{scrollMarginTop: 120, marginTop: 40}}>
                            <h2>Thông tin cần lưu ý</h2>
                            <div style={{borderBottom: "1px solid #eee", marginBottom: 16, display: "flex", gap: 8}}>
                                {infoTabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setInfoTab(tab.key)}
                                        style={{
                                            border: "none",
                                            background: infoTab === tab.key ? "#eaf2ff" : "#f7f7f7",
                                            color: infoTab === tab.key ? "#1f50ea" : "#222",
                                            fontWeight: infoTab === tab.key ? 600 : 400,
                                            padding: "8px 18px",
                                            borderRadius: "6px 6px 0 0",
                                            cursor: "pointer",
                                            outline: "none",
                                            borderBottom: infoTab === tab.key ? "2px solid #1f50ea" : "2px solid transparent",
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div
                                style={{padding: 8, background: "#fff", borderRadius: 8, minHeight: 120}}
                                dangerouslySetInnerHTML={{
                                    __html: infoTabs.find((tab) => tab.key === infoTab)?.content || "<p>Đang tải...</p>",
                                }}
                            />
                        </div>
                        <div id="tour-reviews-section" ref={reviewsSectionRef} style={{scrollMarginTop: 120, marginTop: 40}}>
                            <h2>Đánh giá tour</h2>
                            <div className="tour-review-list">
                                {reviews.map((r, idx) => (
                                    <div key={idx} className="tour-review-item">
                                        <div className="tour-review-name">{r.name}</div>
                                        <div className="tour-review-rating">
                                            {"★".repeat(r.rating)}
                                            <span>{r.rating}/5</span>
                                        </div>
                                        <div className="tour-review-comment">{r.comment}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right: Price box */}
                <div className="tour-main-right" ref={tourMainRightRef} style={{position: "sticky", top: 100}}>
                    <div className="tour-price-box custom-tour-price-box">
                        <div className="tour-price-box-inner">
                            <div className="tour-price-box-title">Lịch Trình và Giá Tour</div>
                            <div className="tour-price-box-desc">Chọn Lịch Trình và Xem Giá:</div>
                            <div className="tour-date-btn-group" style={{position: "relative"}}>
                                <button className={"tour-date-btn" + (selectedDate === "13/06" ? " active" : "")} onClick={() => setSelectedDate("13/06")}>
                                    13/06
                                </button>
                                <button className={"tour-date-btn" + (selectedDate === "20/06" ? " active" : "")} onClick={() => setSelectedDate("20/06")}>
                                    20/06
                                </button>
                                <button className={"tour-date-btn" + (selectedDate === "27/06" ? " active" : "")} onClick={() => setSelectedDate("27/06")}>
                                    27/06
                                </button>
                                <button
                                    ref={buttonRef} // ⬅️ quan trọng
                                    className={"tour-date-btn-all tour-date-btn" + (selectedDate === "all" ? " active" : "")}
                                    onClick={() => {
                                        if (selectedDate === "all") {
                                            setShowCalendar((prev) => !prev); // toggle lịch
                                        } else {
                                            setSelectedDate("all");
                                            setShowCalendar(true);
                                        }
                                    }}
                                    style={{position: "relative", zIndex: 2}}
                                >
                                    <i className="fa-regular fa-calendar"></i>Tất cả
                                </button>
                                {showCalendar && selectedDate === "all" && (
                                    <div ref={calendarRef} className="tour-calendar-dropdown">
                                        <Calendar />
                                    </div>
                                )}
                            </div>
                            {/* Chọn số lượng khách */}
                            <div className="tour-guest-select-box">
                                {/* Người lớn */}
                                <div className="tour-guest-row guest-adult">
                                    <div className="tour-guest-info">
                                        <span className="tour-guest-label">Người lớn</span>
                                        <span className="tour-guest-desc">{getAgeRange("adult")}</span>
                                    </div>
                                    <div className="tour-guest-qty">
                                        <span className="tour-guest-price">x {getPriceByType("adult").toLocaleString()}</span>
                                        <button className="qty-btn" onClick={() => handleGuestChange("adult", -1)}>
                                            <i className="fa-solid fa-minus"></i>
                                        </button>
                                        <span className="tour-guest-count">{guestCounts.adult}</span>
                                        <button className="qty-btn" onClick={() => handleGuestChange("adult", 1)}>
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                                {/* Trẻ em */}
                                <div className="tour-guest-row">
                                    <div className="tour-guest-info">
                                        <span className="tour-guest-label">Trẻ em</span>
                                        <span className="tour-guest-desc">{getAgeRange("child")}</span>
                                    </div>
                                    <div className="tour-guest-qty">
                                        <span className="tour-guest-price">x {getPriceByType("child").toLocaleString()}</span>
                                        <button className="qty-btn" onClick={() => handleGuestChange("child58", -1)}>
                                            <i className="fa-solid fa-minus"></i>
                                        </button>
                                        <span className="tour-guest-count">{guestCounts.child58}</span>
                                        <button className="qty-btn" onClick={() => handleGuestChange("child58", 1)}>
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                                {/* Trẻ nhỏ */}
                                <div className="tour-guest-row last">
                                    <div className="tour-guest-info">
                                        <span className="tour-guest-label">Trẻ nhỏ</span>
                                        <span className="tour-guest-desc">{getAgeRange("infant")}</span>
                                    </div>
                                    <div className="tour-guest-qty">
                                        <span className="tour-guest-price">x {getPriceByType("infant").toLocaleString()}</span>
                                        <button className="qty-btn" onClick={() => handleGuestChange("infant", -1)}>
                                            <i className="fa-solid fa-minus"></i>
                                        </button>
                                        <span className="tour-guest-count">{guestCounts.infant}</span>
                                        <button className="qty-btn" onClick={() => handleGuestChange("infant", 1)}>
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Liên hệ xác nhận chỗ */}
                            <div className="tour-contact-confirm">
                                <i className="fa-regular fa-circle-question"></i>
                                <span>Liên hệ để xác nhận chỗ</span>
                            </div>
                            {/* Giá gốc và tổng giá */}
                            <div className="tour-price-summary">
                                <div className="tour-price-summary-item">
                                    <div className="tour-price-summary-label">Giá gốc</div>
                                    <div className="tour-price-summary-old">6.300.000 đ</div>
                                </div>

                                <div className="tour-price-summary-item">
                                    <div className="tour-price-summary-label-total">Tổng Giá Tour</div>
                                    <div className="tour-price-summary-total">{totalPrice.toLocaleString()} đ</div>
                                </div>
                            </div>
                            {/* Nút đặt */}
                            <button className="tour-book-btn custom-tour-book-btn">Yêu cầu đặt</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related tours */}
            <div className="tour-related">
                <TourCategory title="Khách hàng còn xem thêm" tours={domesticTours} link="/danh-muc-tour?type=domestic" categoryId="domestic" />
            </div>

            {/* Suggestions */}
            <div className="tour-suggest">
                <h2>Có thể bạn sẽ thích</h2>
                <VietnamGrid destinations={vietnamDestinations} />
            </div>
        </div>
    );
}

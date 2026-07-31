import React, {useState, useRef, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom"; // để lấy id từ URL
import "./TourDetail.css";

import haGiang from "../../assets/ha_giang.webp";
import haLong from "../../assets/ha_long.webp";
import hoBaBe from "../../assets/ho_ba_be.webp";
import daNang from "../../assets/da_nang.webp";
import ninhThuan from "../../assets/ninh_thuan.webp";
import mienTay from "../../assets/mien_tay.webp";
import TourCategory from "../../components/tourCategory/TourCategory";
import VietnamGrid from "../../components/vietNam/VietnamGrid";
import {getRatingLabel} from "../../utils/ratingUtils";
import CustomCalendarInput from "../../components/calendar/Calendar";

import axios from "axios";

// Dữ liệu cho Khám phá Việt Nam
const vietnamDestinations = [
    // ví dụ: Hà Giang có location_id = 177 -> sẽ navigate tới ?location_id=177
    {title: "Hà Giang", image: haGiang, className: "ha-giang", link: "/danh-muc-tour?location_id=177"},
    {title: "Hạ Long", image: haLong, className: "ha-long", link: "/danh-muc-tour?location_id=35"},
    {title: "Hồ Ba Bể - Thác Bản Giốc", image: hoBaBe, className: "ho-ba-be", link: "/danh-muc-tour?location_id=27"},
    {title: "Đà Nẵng", image: daNang, className: "da-nang", link: "/danh-muc-tour?location_id=38"},
    {title: "Ninh Thuận", image: ninhThuan, className: "ninh-thuan", link: "/danh-muc-tour?location_id=71"},
    {title: "Miền Tây", image: mienTay, className: "mien-tay", link: "/danh-muc-tour?location_id=90"},
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
    {label: "Giới thiệu", key: "intro", id: "tour-intro-section"},
    {label: "Chương trình tour", key: "itinerary", id: "tour-itinerary-section"},
    {label: "Lịch khởi hành", key: "departure", id: "tour-departure-section"},
    {label: "Thông tin cần lưu ý", key: "terms", id: "tour-terms-section"},
];

const fixImageUrl = (html) => {
    if (!html) return html;

    const API_BASE = import.meta.env.VITE_API_BASE || "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    doc.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src");
        const srcset = img.getAttribute("srcset");

        if (src) {
            if (src.startsWith("/")) {
                // Ưu tiên trỏ về Backend nếu là folder uploads
                if (src.startsWith("/uploads")) {
                    img.setAttribute("src", API_BASE + src);
                } else {
                    img.setAttribute("src", "https://pystravel.vn" + src);
                }
            }
        }

        if (srcset) {
            const fixedSrcset = srcset
                .split(",")
                .map((part) => {
                    const trimmed = part.trim();
                    const urlMatch = trimmed.match(/^(\/[^ ]+)/);
                    if (urlMatch) {
                        const url = urlMatch[1];
                        const rest = trimmed.substring(url.length);
                        if (url.startsWith("/uploads")) {
                            return `${API_BASE}${url}${rest}`;
                        }
                        return `https://pystravel.vn${url}${rest}`;
                    }
                    return trimmed;
                })
                .join(", ");
            img.setAttribute("srcset", fixedSrcset);
        }
    });

    return doc.body.innerHTML;
};

const formatDateToDDMM = (dateStr) => {
    // console.log("👉 typeof:", typeof dateStr, "| value:", dateStr);
    if (typeof dateStr !== "string") {
        throw new Error("dateStr không phải string");
    }
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}`;
};

export default function TourDetail() {
    const [mainImgIdx, setMainImgIdx] = useState(0);
    const [activeTab, setActiveTab] = useState(tabSections[0].key);
    const [showFullIntro, setShowFullIntro] = useState(false); // Trạng thái hiển thị nội dung đầy đủ
    const [showSeeMore, setShowSeeMore] = useState(false); // Trạng thái hiển thị nút "Xem thêm"

    const [selectedDate, setSelectedDate] = useState(null); // State cho ngày đang chọn
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
    const [activeIndexes, setActiveIndexes] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const [infoTabs, setInfoTabs] = useState([]); // Danh sách các tab
    const [infoTab, setInfoTab] = useState(""); // Tab hiện tại được chọn

    // state cho dữ liệu tour, lịch khởi hành, giá, overview và schedules, reviews
    const [tour, setTour] = useState({});
    const [departures, setDepartures] = useState([]);
    const [shortDepartures, setShortDepartures] = useState([]);
    const [prices, setPrices] = useState([]);
    const [overview, setOverview] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [terms, setTerms] = useState([]);
    const [loading, setLoading] = useState(true);

    const {id} = useParams(); // giả sử route là /tour/:id

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const API_BASE = import.meta.env.VITE_API_BASE || "";
                const response = await axios.get(`${API_BASE}/api/tours/${id}`);
                const {success, data} = response.data;
                
                if (success && data) {
                    setTour(data);
                    setDepartures(data.departures || []);
                    setPrices(data.prices || []);
                    setOverview({
                        content: fixImageUrl(data.overview),
                    });
                    setSchedules(
                        (data.schedules || []).map((schedule) => ({
                            ...schedule,
                            content: fixImageUrl(schedule.content),
                        }))
                    );
                    setReviews(data.reviews || []);
                    setTerms(data.terms || []);
                    
                    if (data.departures && data.departures.length > 0) {
                        const allDates = data.departures
                            .map(d => d.departure_date)
                            .sort((a, b) => new Date(a) - new Date(b));
                        setShortDepartures(allDates.slice(0, 3));
                        setSelectedDate(allDates[0]);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi fetch tour details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Set giá trị mặc định cho selectedDate sau khi departures được fetch xong
    useEffect(() => {
        if (departures.length > 0 && !selectedDate) {
            setSelectedDate(departures[0].departure_date);
        }
    }, [departures]);

    useEffect(() => {
        if (terms.length > 0) {
            const mappedTabs = terms.map((term, index) => ({
                key: `term-${index}`,
                label: term.section_title,
                content: term.content,
            }));
            setInfoTabs(mappedTabs);
            setInfoTab(`term-0`); // chọn tab đầu tiên mặc định
        }
    }, [terms]);

    useEffect(() => {
        if (introRef.current && introRef.current.scrollHeight > 300) {
            setShowSeeMore(true);
        } else {
            setShowSeeMore(false);
        }
    }, [overview, showFullIntro]);

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
        if (showAll) return;

        if (activeIndexes.includes(index)) {
            // Nếu đang mở → đóng lại
            setActiveIndexes(activeIndexes.filter((i) => i !== index));
        } else {
            // Nếu đang đóng → mở thêm
            setActiveIndexes([...activeIndexes, index]);
        }
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
            return `${found.min_age} tuổi trở lên`;
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
            const current = typeof prev[type] === "number" ? prev[type] : (parseInt(prev[type], 10) || min);
            const next = Math.max(min, current + delta);
            return {...prev, [type]: next};
        });
    };

    // Hàm xử lý nhập trực tiếp ô số lượng
    const handleGuestInputChange = (type, value) => {
        if (value === "") {
            setGuestCounts((prev) => ({...prev, [type]: ""}));
            return;
        }
        const parsed = parseInt(value, 10);
        if (isNaN(parsed)) return;
        let min = type === "adult" ? 1 : 0;
        const validVal = Math.max(min, parsed);
        setGuestCounts((prev) => ({...prev, [type]: validVal}));
    };

    const handleGuestInputBlur = (type) => {
        let min = type === "adult" ? 1 : 0;
        setGuestCounts((prev) => {
            const current = prev[type];
            if (current === "" || current === null || current === undefined || isNaN(Number(current)) || Number(current) < min) {
                return {...prev, [type]: min};
            }
            return {...prev, [type]: Number(current)};
        });
    };

    // Tính tổng tiền
    const totalPrice =
        (Number(guestCounts.adult) || 0) * getPriceByType("adult") +
        (Number(guestCounts.child58) || 0) * getPriceByType("child") +
        (Number(guestCounts.child24) || 0) * getPriceByType("child") + // Nếu có loại child24 riêng thì sửa lại
        (Number(guestCounts.infant) || 0) * getPriceByType("infant");

    // ------Xử lý hiển thị active của ngày khởi hành------
    const selectedIndex = shortDepartures.findIndex((d) => d === selectedDate);

    let visibleDates = [];
    if (selectedIndex === 0) {
        // Chọn phần tử đầu tiên, active nằm bên trái
        visibleDates = shortDepartures.slice(0, 3);
    } else if (selectedIndex === shortDepartures.length - 1) {
        // Chọn phần tử cuối cùng, active nằm bên phải
        visibleDates = shortDepartures.slice(-3);
    } else if (selectedIndex > 0) {
        // Các phần tử ở giữa, active nằm giữa
        visibleDates = shortDepartures.slice(selectedIndex - 1, selectedIndex + 2);
    } else {
        // fallback nếu chưa chọn ngày → hiển thị 3 ngày đầu
        visibleDates = shortDepartures.slice(0, 3);
    }

    const handleCalendarChange = (isoDate) => {
        // Nếu ngày chưa có trong danh sách thì thêm vào
        if (!shortDepartures.find((d) => d === isoDate)) {
            const updated = [...shortDepartures, isoDate].sort((a, b) => new Date(a) - new Date(b));
            // console.log("Cập nhật ngày khởi hành mới:", updated);
            setShortDepartures(updated);
        }

        setSelectedDate(isoDate);
    };

    const handleBooking = () => {
        const bookingData = {
            date: selectedDate,
            adult: Number(guestCounts.adult) || 1,
            child58: Number(guestCounts.child58) || 0,
            child24: Number(guestCounts.child24) || 0,
            infant: Number(guestCounts.infant) || 0,
        };

        try {
            sessionStorage.setItem(`booking_draft_${id}`, JSON.stringify(bookingData));
        } catch (e) {
            console.error("Failed to save booking draft to sessionStorage", e);
        }

        navigate(`/booking/${id}`, { state: bookingData });
    };

    // Di chuyển vào trong component để dùng được biến prices
    const getOldPriceByType = (type) => {
        const found = prices.find((p) => p.target_type === type);
        if (!found) return 0;
        if (found.old_price !== undefined && found.old_price !== null && found.old_price !== "") {
            return found.old_price;
        }
        if (found.price !== undefined && found.price !== null && found.price !== "") {
            return Math.round(Number(found.price) * 0.8);
        }
        return 0;
    };

    if (loading) {
        return (
            <div className="tour-detail-container tour-detail-skeleton">
                {/* Breadcrumb Skeleton */}
                <div className="skeleton-box skeleton-breadcrumb"></div>

                {/* Header Skeleton */}
                <div className="tour-header" style={{marginBottom: 20}}>
                    <div className="skeleton-box skeleton-tour-title"></div>
                    <div className="skeleton-box skeleton-tour-rating"></div>
                </div>

                {/* Main Content Skeleton */}
                <div className="tour-main" style={{position: "relative"}}>
                    {/* Left Column */}
                    <div className="tour-main-left">
                        <div className="skeleton-box skeleton-main-img"></div>
                        <div className="tour-main-thumbs" style={{marginTop: 12, display: "flex", gap: 10}}>
                            <div className="skeleton-box skeleton-thumb"></div>
                            <div className="skeleton-box skeleton-thumb"></div>
                            <div className="skeleton-box skeleton-thumb"></div>
                            <div className="skeleton-box skeleton-thumb"></div>
                        </div>

                        <div className="tour-main-summary" style={{marginTop: 24}}>
                            <div className="skeleton-box skeleton-summary-row"></div>
                            <div className="skeleton-box skeleton-summary-list"></div>
                        </div>

                        <div className="tour-main-tabs" style={{marginTop: 24, display: "flex", gap: 12}}>
                            <div className="skeleton-box skeleton-tab-btn"></div>
                            <div className="skeleton-box skeleton-tab-btn"></div>
                            <div className="skeleton-box skeleton-tab-btn"></div>
                            <div className="skeleton-box skeleton-tab-btn"></div>
                        </div>

                        <div className="tour-main-tab-content" style={{marginTop: 24}}>
                            <div className="skeleton-box skeleton-line-full"></div>
                            <div className="skeleton-box skeleton-line-full"></div>
                            <div className="skeleton-box skeleton-line-70"></div>
                            <div className="skeleton-box skeleton-line-50"></div>
                        </div>
                    </div>

                    {/* Right Column (Price Box Skeleton) */}
                    <div className="tour-main-right" style={{position: "sticky", top: 100}}>
                        <div className="tour-price-box custom-tour-price-box">
                            <div className="skeleton-box skeleton-price-box-header"></div>
                            <div className="skeleton-box skeleton-date-group"></div>
                            <div className="skeleton-box skeleton-guest-select"></div>
                            <div className="skeleton-box skeleton-total-price"></div>
                            <div className="skeleton-box skeleton-book-btn"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                <div
                    className="tour-card-row-rating"
                    title="Click để xem đánh giá"
                    onClick={() => handleTabClick("tour-reviews-section", "reviews")}
                    style={{cursor: "pointer"}}
                >
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
                        {tour.images && tour.images.length > 0 ? (
                            <img 
                                src={typeof tour.images[mainImgIdx] === 'string' 
                                    ? (tour.images[mainImgIdx].startsWith('/') ? (import.meta.env.VITE_API_BASE + tour.images[mainImgIdx]) : tour.images[mainImgIdx])
                                    : (tour.images[mainImgIdx].image_url?.startsWith('/') ? (import.meta.env.VITE_API_BASE + tour.images[mainImgIdx].image_url) : tour.images[mainImgIdx].image_url)} 
                                alt="main" 
                            />
                        ) : (
                            <div
                                style={{width: 400, height: 250, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center"}}
                            >
                                Không có ảnh
                            </div>
                        )}
                        <div className="img-nav-btn right" onClick={nextImg}>
                            <i className="fa-solid fa-chevron-right"></i>
                        </div>
                    </div>
                    {/* Thumbnails */}
                    <div className="tour-main-thumbs">
                        {getVisibleThumbnails().map((img, i) => {
                            const realIdx = (mainImgIdx + i) % tour.images.length;
                            return (
                                <img
                                    key={i}
                                    src={typeof img === 'string' 
                                        ? (img.startsWith('/') ? (import.meta.env.VITE_API_BASE + img) : img)
                                        : (img.image_url?.startsWith('/') ? (import.meta.env.VITE_API_BASE + img.image_url) : img.image_url)}
                                    alt={`thumb-${realIdx}`}
                                    className={mainImgIdx === realIdx ? "active" : ""}
                                    onClick={() => setMainImgIdx(realIdx)}
                                />
                            );
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
                            <button
                                key={t.key}
                                className={"tour-main-tab-btn" + (activeTab === t.key ? " active" : "")}
                                onClick={() => handleTabClick(t.id, t.key)}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <div className="tour-main-tab-content">
                        <div id="tour-intro-section" style={{scrollMarginTop: 120, position: "relative"}}>
                            <h2>Giới thiệu chung</h2>
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

                            {showSeeMore && (
                                <div style={{textAlign: "center", marginTop: 12}}>
                                    {!showFullIntro ? (
                                        <button
                                            ref={seeMoreRef}
                                            className="see-more-btn"
                                            style={{
                                                background: "#eaf2ff",
                                                color: "#1f50ea",
                                                border: "none",
                                                borderRadius: 6,
                                                padding: "8px 18px",
                                                cursor: "pointer",
                                                fontWeight: 500,
                                            }}
                                            onClick={handleExpand}
                                        >
                                            Xem thêm <i className="fa-solid fa-chevron-down" style={{fontSize: 12}}></i>
                                        </button>
                                    ) : (
                                        <button
                                            className="see-more-btn"
                                            style={{
                                                background: "#f7f7f7",
                                                color: "#1f50ea",
                                                border: "none",
                                                borderRadius: 6,
                                                padding: "8px 18px",
                                                cursor: "pointer",
                                                fontWeight: 500,
                                            }}
                                            onClick={handleCollapse}
                                        >
                                            Thu gọn <i className="fa-solid fa-chevron-up" style={{fontSize: 12}}></i>
                                        </button>
                                    )}
                                </div>
                            )}
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
                                                onClick={showAll ? undefined : () => toggleContent(idx)}
                                                style={{cursor: showAll ? "default" : "pointer"}} // Vô hiệu hóa click nếu đang "xem tất cả"
                                            >
                                                <div className="tour-program-info">
                                                    <div className="tour-program-day">{item.day_text}</div>
                                                    <div className="tour-program-title">{item.title}</div>
                                                </div>
                                                <i
                                                    className={`fa-solid ${showAll || activeIndexes.includes(idx) ? "fa-angle-up" : "fa-angle-down"}`}
                                                ></i>
                                            </div>
                                            <div className={`tour-program-content ${showAll || activeIndexes.includes(idx) ? "open" : ""}`}>
                                                <div className="tour-program-inner" dangerouslySetInnerHTML={{__html: item.content}} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div>Không có dữ liệu lịch trình</div>
                                )}
                            </div>
                        </div>

                        <div id="tour-terms-section" style={{scrollMarginTop: 120, marginTop: 40}}>
                            <h2>Thông tin cần lưu ý</h2>
                            <div style={{borderBottom: "1px solid #eee", marginBottom: 12, display: "flex", gap: 8}}>
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
                                className="custom-content"
                                dangerouslySetInnerHTML={{
                                    __html: infoTabs.find((tab) => tab.key === infoTab)?.content || "<p>Đang tải...</p>",
                                }}
                            />
                        </div>
                        {/* <div id="tour-reviews-section" ref={reviewsSectionRef} style={{scrollMarginTop: 120, marginTop: 40}}>
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
                        </div> */}
                    </div>
                </div>
                {/* Right: Price box */}
                <div className="tour-main-right" ref={tourMainRightRef} style={{position: "sticky", top: 100}}>
                    <div className="tour-price-box custom-tour-price-box">
                        <div className="tour-price-box-inner">
                            <div className="tour-price-box-title">Lịch Trình và Giá Tour</div>
                            <div className="tour-price-box-desc">Chọn Lịch Trình và Xem Giá:</div>
                            <div className="tour-date-btn-group" style={{position: "relative", display: "flex", flexDirection: "column", gap: 8}}>
                                <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
                                    {visibleDates.map((d) => (
                                        <button
                                            key={d}
                                            className={"tour-date-btn" + (selectedDate === d ? " active" : "")}
                                            onClick={() => setSelectedDate(d)}
                                        >
                                            {formatDateToDDMM(d)}
                                        </button>
                                    ))}

                                    <CustomCalendarInput
                                        tourId={tour.id}
                                        value={selectedDate}
                                        onChange={handleCalendarChange}
                                        providedDates={departures.map((d) => d.departure_date)}
                                    />
                                </div>
                                {/* Hiển thị ngày tham quan đã chọn */}
                                {selectedDate && (
                                    <div
                                        style={{
                                            marginTop: 8,
                                            background: "#eaf6fd",
                                            borderRadius: 8,
                                            padding: "12px 0",
                                            textAlign: "center",
                                            color: "#183153",
                                        }}
                                    >
                                        <div style={{fontSize: 15, marginBottom: 2, opacity: 0.7}}>Ngày tham quan đã chọn</div>
                                        <div style={{fontWeight: 700, fontSize: 20}}>
                                            {(() => {
                                                const date = new Date(selectedDate);
                                                // console.log("Selected date:", selectedDate, "Parsed date:", date);
                                                const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
                                                return `${days[date.getDay()]}, ${date.getDate()} thg ${date.getMonth() + 1} ${date.getFullYear()}`;
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Chọn số lượng khách */}
                            <div className="tour-guest-select-box">
                                {/* Người lớn */}
                                <div className="tour-guest-row guest-adult">
                                    <div className="tour-guest-info">
                                        <span className="tour-guest-label">Người lớn</span>
                                        <span className="tour-guest-price" style={{fontSize: 18, fontWeight: 700}}>
                                            {getPriceByType("adult").toLocaleString()} VND
                                        </span>
                                        {getOldPriceByType("adult") > 0 && (
                                            <span
                                                className="tour-guest-old-price"
                                                style={{
                                                    display: "block",
                                                    fontSize: 13,
                                                    color: "#888",
                                                    textDecoration: "line-through",
                                                    marginTop: 2,
                                                }}
                                            >
                                                {getOldPriceByType("adult").toLocaleString()} VND
                                            </span>
                                        )}
                                        <span className="tour-guest-desc">{getAgeRange("adult")}</span>
                                    </div>
                                    <div className="tour-guest-qty">
                                        <button className="qty-btn" onClick={() => handleGuestChange("adult", -1)}>
                                            <i className="fa-solid fa-minus"></i>
                                        </button>
                                        <input
                                            type="number"
                                            className="tour-guest-count"
                                            value={guestCounts.adult}
                                            onChange={(e) => handleGuestInputChange("adult", e.target.value)}
                                            onBlur={() => handleGuestInputBlur("adult")}
                                            min={1}
                                        />
                                        <button className="qty-btn" onClick={() => handleGuestChange("adult", 1)}>
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                                {/* Trẻ em */}
                                <div className="tour-guest-row">
                                    <div className="tour-guest-info">
                                        <span className="tour-guest-label">Trẻ em</span>
                                        <span className="tour-guest-price" style={{fontSize: 18, fontWeight: 700}}>
                                            {getPriceByType("child").toLocaleString()} VND
                                        </span>
                                        {getOldPriceByType("child") > 0 && (
                                            <span
                                                className="tour-guest-old-price"
                                                style={{
                                                    display: "block",
                                                    fontSize: 13,
                                                    color: "#888",
                                                    textDecoration: "line-through",
                                                    marginTop: 2,
                                                }}
                                            >
                                                {getOldPriceByType("child").toLocaleString()} VND
                                            </span>
                                        )}
                                        <span className="tour-guest-desc">{getAgeRange("child")}</span>
                                    </div>
                                    <div className="tour-guest-qty">
                                        <button className="qty-btn" onClick={() => handleGuestChange("child58", -1)}>
                                            <i className="fa-solid fa-minus"></i>
                                        </button>
                                        <input
                                            type="number"
                                            className="tour-guest-count"
                                            value={guestCounts.child58}
                                            onChange={(e) => handleGuestInputChange("child58", e.target.value)}
                                            onBlur={() => handleGuestInputBlur("child58")}
                                            min={0}
                                        />
                                        <button className="qty-btn" onClick={() => handleGuestChange("child58", 1)}>
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Giá gốc và tổng giá */}
                            <div className="tour-price-summary">
                                <div className="tour-price-summary-item">
                                    <div className="tour-price-summary-label-total">Tổng giá tiền</div>
                                    <div className="tour-price-summary-total">{totalPrice.toLocaleString()} đ</div>
                                </div>
                            </div>
                            {/* Nút đặt */}
                            <button className="tour-book-btn custom-tour-book-btn" onClick={handleBooking}>
                                Đặt ngay
                            </button>
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

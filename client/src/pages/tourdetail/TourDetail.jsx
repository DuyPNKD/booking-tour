import React, {useState} from "react";
import "./TourDetail.css";
import detail1 from "../../assets/detail1.webp";
import detail2 from "../../assets/detail2.webp";
import detail3 from "../../assets/detail3.webp";
import detail4 from "../../assets/detail4.webp";
import detail5 from "../../assets/detail5.webp";
import detail6 from "../../assets/detail6.webp";
import detail7 from "../../assets/detail7.webp";
import VietnamGrid from "../../components/vietNam/VietnamGrid";
import haGiang from "../../assets/ha_giang.webp";
import haLong from "../../assets/ha_long.webp";
import hoBaBe from "../../assets/ho_ba_be.webp";
import daNang from "../../assets/da_nang.webp";
import ninhThuan from "../../assets/ninh_thuan.webp";
import mienTay from "../../assets/mien_tay.webp";

const tour = {
    title: "Tour Vĩnh Hy - Ninh Thuận 3 ngày 2 đêm từ TP.HCM",
    price: 3380000,
    oldPrice: 3980000,
    duration: "3 ngày 2 đêm",
    location: "Khởi hành: Hồ Chí Minh",
    schedule: "Lịch khởi hành: Thứ 6 hàng tuần",
    images: [detail1, detail2, detail3, detail4, detail5, detail6, detail7],
    highlights: ["Khuyến mãi ĐẶC BIỆT", "Khám phá vịnh Vĩnh Hy", "Tham quan tháp Chàm", "Trải nghiệm vườn nho Ninh Thuận", "Ưu đãi cho khách hàng cao tuổi"],
    itinerary: [
        {
            day: "NGÀY 1",
            title: "HỒ CHÍ MINH – NINH THUẬN – KHU DU LỊCH TANYOLI",
            meals: "(ăn sáng, trưa, tối)",
        },
        {
            day: "NGÀY 2",
            title: "ĐỒNG CỪU AN HOÀ – HANG RÁI – VỊNH VĨNH HY – VƯỜN NHO THÁI AN – ĐỒI CÁT NAM CƯƠNG",
            meals: "(ăn sáng, trưa, tối)",
        },
        {
            day: "NGÀY 3",
            title: "KHÁM PHÁ NINH THUẬN",
            meals: "(ăn sáng, trưa)",
        },
    ],
    includes: ["Xe du lịch đời mới, máy lạnh suốt tuyến", "Khách sạn 3 sao, 2 khách/phòng", "Ăn uống theo chương trình", "Vé tham quan các điểm du lịch", "Hướng dẫn viên chuyên nghiệp"],
    excludes: ["Chi phí cá nhân, giặt ủi, điện thoại", "Nước uống, ăn uống ngoài chương trình", "Tiền tip cho hướng dẫn viên, tài xế"],
    childrenPolicy: ["Trẻ em dưới 5 tuổi: miễn phí", "Trẻ em từ 5-10 tuổi: 75% giá tour", "Trẻ em trên 10 tuổi: tính như người lớn"],
    cancelPolicy: ["Huỷ trước 7 ngày: không mất phí", "Huỷ từ 3-6 ngày: mất 50% giá tour", "Huỷ sau 3 ngày: mất 100% giá tour"],
    reviews: [
        {
            name: "Lan Hương Trương",
            rating: 5,
            comment: "Xe mới, sạch sẽ, hướng dẫn viên nhiệt tình, lịch trình hợp lý. Sẽ quay lại!",
        },
        {
            name: "Minh Châu",
            rating: 5,
            comment: "Chuyến đi rất vui, dịch vụ tốt, giá hợp lý. Cảm ơn DTravel!",
        },
    ],
    relatedTours: [
        {
            title: "Tour Phú Quốc 3 ngày 2 đêm từ TP.HCM",
            price: 4960000,
            image: "/images/related1.jpg",
        },
        {
            title: "Tour Ninh Thuận - Vĩnh Hy 4 ngày 3 đêm từ Hà Nội",
            price: 7230000,
            image: "/images/related2.jpg",
        },
        {
            title: "Tour Cô Tô 3 ngày 2 đêm từ Hà Nội",
            price: 2960000,
            image: "/images/related3.jpg",
        },
        {
            title: "Tour Cam Ranh - Nha Trang 4 ngày",
            price: 4980000,
            image: "/images/related4.jpg",
        },
    ],
    suggestions: [
        {title: "Hà Giang", image: haGiang, className: "ha-giang"},
        {title: "Hạ Long", image: haLong, className: "ha-long"},
        {title: "Hồ Ba Bể - Thác Bản Giốc", image: hoBaBe, className: "ho-ba-be"},
        {title: "Đà Nẵng", image: daNang, className: "da-nang"},
        {title: "Ninh Thuận", image: ninhThuan, className: "ninh-thuan"},
        {title: "Miền Tây", image: mienTay, className: "mien-tay"},
    ],
};

const tabSections = [
    {label: "Giới thiệu", key: "intro", id: "tour-intro-section"},
    {label: "Lịch trình", key: "itinerary", id: "tour-itinerary-section"},
    {label: "Bao gồm và điều khoản", key: "terms", id: "tour-terms-section"},
    {label: "Đánh giá tour", key: "reviews", id: "tour-reviews-section"},
];

export default function TourDetail() {
    const [accordion, setAccordion] = useState(null);
    const [mainImgIdx, setMainImgIdx] = useState(0);
    const [activeTab, setActiveTab] = useState(tabSections[0].key);

    const prevImg = () => setMainImgIdx((prev) => (prev === 0 ? tour.images.length - 1 : prev - 1));
    const nextImg = () => setMainImgIdx((prev) => (prev === tour.images.length - 1 ? 0 : prev + 1));

    const getVisibleThumbnails = () => {
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
                <div className="tour-rating-row">
                    <span className="tour-stars">
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star-half-stroke"></i>
                    </span>
                    <span className="tour-rating-score">4.9</span>
                    <span className="tour-booked">| 1214+ đã đặt chỗ</span>
                </div>
            </div>
            {/* Main content */}
            <div className="tour-main">
                {/* Left: Images & Info */}

                <div className="tour-main-left">
                    {/* Slider ảnh lớn */}
                    <div className="tour-main-img-slider">
                        <div className="img-nav-btn left" onClick={prevImg}>
                            <i className="fa-solid fa-chevron-left"></i>
                        </div>
                        <img src={tour.images[mainImgIdx]} alt="main" />
                        <div className="img-nav-btn right" onClick={nextImg}>
                            <i className="fa-solid fa-chevron-right"></i>
                        </div>
                    </div>
                    {/* Thumbnails */}
                    <div className="tour-main-thumbs">
                        {getVisibleThumbnails().map((img, i) => {
                            const realIdx = (mainImgIdx + i) % tour.images.length;
                            return (
                                <div key={img} className="thumb-wrapper">
                                    <img src={img} alt={`thumb${realIdx}`} className={mainImgIdx === realIdx ? "active" : ""} onClick={() => setMainImgIdx(realIdx)} />
                                </div>
                            );
                        })}
                    </div>

                    <div className="tour-main-tabs">
                        {tabSections.map((t) => (
                            <button key={t.key} className={"tour-main-tab-btn" + (activeTab === t.key ? " active" : "")} onClick={() => handleTabClick(t.id, t.key)}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <div className="tour-main-tab-content">
                        <div id="tour-intro-section" style={{scrollMarginTop: 120}}>
                            <h2>Giới thiệu chung</h2>
                            <p>Trải nghiệm tour du lịch Vĩnh Hy - Ninh Thuận 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất "nắng như rang, gió như phan". </p>
                            <div className="tour-highlight">
                                <span>Điểm nổi bật:</span>
                                <ul>
                                    {tour.highlights.map((h) => (
                                        <li key={h}>{h}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div id="tour-itinerary-section" style={{scrollMarginTop: 120, marginTop: 40}}>
                            <h2>Lịch trình</h2>
                            <ul className="tour-itinerary">
                                {tour.itinerary.map((item, idx) => (
                                    <li key={idx}>
                                        <b>{item.day}:</b> {item.title} <span>{item.meals}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div id="tour-terms-section" style={{scrollMarginTop: 120, marginTop: 40}}>
                            <div className="tour-accordion">
                                {[
                                    {title: "Giá tour bao gồm", content: tour.includes},
                                    {title: "Giá tour không bao gồm", content: tour.excludes},
                                    {title: "Chính sách trẻ em", content: tour.childrenPolicy},
                                    {title: "Chính sách hoàn huỷ", content: tour.cancelPolicy},
                                ].map((item, idx) => (
                                    <div key={item.title} className="accordion-item">
                                        <div className="accordion-title" onClick={() => setAccordion(accordion === idx ? null : idx)}>
                                            {item.title}
                                            <span>{accordion === idx ? "−" : "+"}</span>
                                        </div>
                                        {accordion === idx && (
                                            <ul className="accordion-content">
                                                {item.content.map((c, i) => (
                                                    <li key={i}>{c}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div id="tour-reviews-section" style={{scrollMarginTop: 120, marginTop: 40}}>
                            <h2>Đánh giá tour</h2>
                            <div className="tour-review-list">
                                {tour.reviews.map((r, idx) => (
                                    <div key={idx} className="tour-review-item">
                                        <div className="tour-review-name">{r.name}</div>
                                        <div className="tour-review-rating">
                                            {"★".repeat(r.rating)}
                                            <span>5/5</span>
                                        </div>
                                        <div className="tour-review-comment">{r.comment}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right: Price box */}
                <div className="tour-main-right">
                    <div className="tour-price-box">
                        <img src={tour.images[0]} alt="main" className="tour-price-img" />
                        <div className="tour-price-title">{tour.title}</div>
                        <div className="tour-old-price">{tour.oldPrice.toLocaleString()}đ</div>
                        <div className="tour-price">
                            {tour.price.toLocaleString()}
                            <span style={{fontSize: 20, fontWeight: 500}}>đ</span>
                        </div>
                        <div className="tour-price-row">
                            <i className="fa-regular fa-clock tour-price-icon"></i>
                            <b>Thời gian:</b>&nbsp;{tour.duration}
                        </div>
                        <div className="tour-price-row">
                            <i className="fa-solid fa-location-dot tour-price-icon"></i>
                            <b>Điểm khởi hành:</b>&nbsp;Hồ Chí Minh
                        </div>
                        <div className="tour-price-row">
                            <i className="fa-regular fa-calendar tour-price-icon"></i>
                            <b>Lịch khởi hành:</b>&nbsp;Thứ 6 hàng tuần
                        </div>
                        <button className="tour-book-btn" style={{width: "100%"}}>
                            Đặt tour ngay
                        </button>
                    </div>
                </div>
            </div>

            {/* Related tours */}
            <div className="tour-related">
                <h3>Khách hàng còn xem thêm</h3>
                <div className="tour-related-list">
                    {tour.relatedTours.map((t, idx) => (
                        <div key={idx} className="tour-related-item">
                            <img src={t.image} alt={t.title} />
                            <div className="tour-related-title">{t.title}</div>
                            <div className="tour-related-price">{t.price.toLocaleString()}đ</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Suggestions */}
            <div className="tour-suggest">
                <h3>Có thể bạn sẽ thích</h3>
                <VietnamGrid destinations={tour.suggestions} />
            </div>
        </div>
    );
}

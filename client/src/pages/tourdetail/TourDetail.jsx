import React, {useState, useRef, useEffect} from "react";
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
import TourCategory from "../../components/tourCategory/TourCategory";
import {useNavigate} from "react-router-dom";

const tour = {
    title: "Tour Vĩnh Hy - Ninh Thuận 3 ngày 2 đêm từ TP.HCM",
    price: 3380000,
    oldPrice: 3980000,
    duration: "3 ngày 2 đêm",
    location: "Khởi hành: Hồ Chí Minh",
    schedule: "Lịch khởi hành: Thứ 6 hàng tuần",
    images: [ninhThuan, detail1, detail2, detail3, detail4, detail5, detail6, detail7],
    highlights: ["Khuyến mãi ĐẶC BIỆT", "Khám phá vịnh Vĩnh Hy", "Tham quan tháp Chàm", "Trải nghiệm vườn nho Ninh Thuận", "Ưu đãi cho khách hàng cao tuổi"],
    itinerary: [
        {
            day: "NGÀY 1",
            title: "HỒ CHÍ MINH – NINH THUẬN – KHU DU LỊCH TANYOLI",
            meals: "(Ăn sáng, trưa, tối)",
        },
        {
            day: "NGÀY 2",
            title: "ĐỒNG CỪU AN HOÀ – HANG RÁI – VỊNH VĨNH HY – VƯỜN NHO THÁI AN – ĐỒI CÁT NAM CƯƠNG",
            meals: "(Ăn sáng, trưa, tối)",
        },
        {
            day: "NGÀY 3",
            title: "KHÁM PHÁ NINH THUẬN",
            meals: "(Ăn sáng, trưa)",
        },
    ],
    includes: [
        "Thuế VAT",
        "Xe tham quan theo chương trình",
        "Khách sạn theo tiêu chuẩn 3 sao : 2 khách/1 phòng, lẻ nam nữ ghép 3",
        "Vé tham quan các điểm theo chương trình",
        "Tàu đáy kính ngắm san hô theo chương trình tham quan Vịnh Vĩnh Hy",
        "Các bữa ăn theo chương trình (4 bữa chính: tiêu chuẩn 150.000 VNĐ/ khách + 1 bữa hải sản trên bè 200.000 VNĐ/khách + 01 bữa sáng 60.000 VNĐ/ khách/ bữa + 02 bữa sáng tại khách sạn)",
        "Hướng dẫn viên tiếng Việt kinh nghiệm, nhiệt tình",
        "Bảo hiểm du lịch với mức bồi thường 30.000.000 VNĐ/vụ",
        "Nước suối 1 chai 500ml/khách/ngày",
    ],
    excludes: ["Chi phí cá nhân, giặt ủi, điện thoại, minibar, phụ phí phòng đơn, đồ uống trong các bữa ăn….", "Các chi phí khác ngoài chương trình tour.", "Tiền tip cho lái xe và HDV địa phương", "Phụ Thu phòng đơn: 800.000 VNĐ/khách"],
    childrenPolicy: ["Trẻ em dưới 5 tuổi miễn phí (ăn uống và ngủ cùng với bố mẹ, bố mẹ tự túc lo cho bé). Hai người lớn chỉ kèm 1 trẻ em, trẻ em thứ 2 trở đi tính giá 50% giá tour người lớn.", "Trẻ em từ 5- dưới 11 tuổi giá tour là 75% giá tour người lớn. (Tiêu chuẩn: 01 suất ăn + 01 ghế ngồi và ngủ ghép cùng giường với bố mẹ). Hai người lớn chỉ kèm 1 trẻ em , trẻ em thứ 2 trở đi tính giá tour như người lớn.", "Trẻ từ 11 tuổi trở lên, tính bằng chi phí người lớn."],
    notes: [
        "Giá và hành trình có thể thay đổi theo từng thời điểm cụ thể, Quý khách vui lòng liên hệ để cập nhật giá và hành trình trước khi đặt tour.",
        "Giờ bay có thể thay đổi theo giờ bay của Hãng hàng không.",
        "Về tính chất đoàn ghép, tour không đủ khách khởi hành sẽ hủy. Đơn vị lữ hành sẽ có nhiệm vụ báo trước tới khách",
        "15ngày và thỏa thuận với khách về ngày khởi hành mới. Mọi chi phí phát sinh hai bên cùng thỏa thuận",
        "Đối với các khách hàng đi riêng lẻ (lẻ 01 người) thì sẽ chịu phí phòng đơn. Khi có khách lẻ khác cùng đăng",
        "kýghép vào thì chúng tôi sẽ trả lại phụ phí phòng đơn cho quý khách",
        "Trẻ em từ 0-5 tuổi: Miễn phí tour, ăn ngủ chung với bố mẹ. (Hai người lớn chỉ được kèm 01 trẻ em. Từ trẻ em thứ",
        "2phụ thu 50% người lớn). Trẻ em từ 1 tuổi trở lên đóng 700.000 VNĐ vé tàu cao tốc",
        "Trẻ em từ 5-11 tuổi: Phụ thu 75% tour. Hai người lớn chỉ được kèm 01 suất trẻ em từ 5-11 tuổi. Từ bé thứ 2, ba mẹ nên mua thêm 01 suất giường đơn.",
        "Trẻ trên 11 tuổi: Tính như người lớn.",
        "Khách nước ngoài phụ thu 10USD/người/ngày, khi đi mang theo 2 bản photo hộ chiếu và bản gốc để đối chiếu.",
    ],
    cancelPolicy: ["Nếu quý khách hủy tour sau khi đăng ký và trước 20 ngày khởi hành: mất phí cọc tour", "Nếu quý khách hủy tour trước 15 ngày khởi hành: phí hủy 50% tiền tour + 100% tiền Vé máy bay.", "Nếu quý khách hủy tour trước 07 ngày khởi hành: phí hủy 70% tiền tour + 100% tiền vé máy bay", "Nếu quý khách hủy tour trong vòng 07 ngày trước ngày khởi hành: phí hủy 100% tiền tour + 100% tiền vé máy bay ( 100% giá trị tour trọn gói)"],
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
    {label: "Lịch trình", key: "itinerary", id: "tour-itinerary-section"},
    {label: "Bao gồm và điều khoản", key: "terms", id: "tour-terms-section"},
    {label: "Đánh giá tour", key: "reviews", id: "tour-reviews-section"},
];

export default function TourDetail() {
    const [accordion, setAccordion] = useState(null);
    const [mainImgIdx, setMainImgIdx] = useState(0);
    const [activeTab, setActiveTab] = useState(tabSections[0].key);
    const [showFullIntro, setShowFullIntro] = useState(false); // Trạng thái hiển thị nội dung đầy đủ
    const [showSeeMore, setShowSeeMore] = useState(false); // Trạng thái hiển thị nút "Xem thêm"
    const introRef = useRef(null); // Ref cho phần nội dung
    const seeMoreRef = useRef(null); // Ref cho nút "Xem thêm"
    const seeMorePositionRef = useRef(null); // Ref lưu vị trí của nút
    const navigate = useNavigate();

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
                                <div key={img} className={"thumb-wrapper" + (mainImgIdx === realIdx ? " active" : "")} onClick={() => setMainImgIdx(realIdx)}>
                                    <img src={img} alt={`thumb${realIdx}`} />
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
                            >
                                <p>
                                    Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích
                                    tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2
                                    đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang
                                    động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú
                                    vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau.
                                    - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như
                                    rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của
                                    đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh
                                    Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần
                                    tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã
                                    ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe
                                    điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng -
                                    Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với
                                    những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn
                                    cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và
                                    hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở
                                    cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3
                                    ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những
                                    hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy
                                    thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên
                                    nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng
                                    như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa
                                    của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour
                                    Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị
                                    thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch
                                    dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên
                                    xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng -
                                    Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với
                                    những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn
                                    cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và
                                    hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở
                                    cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3
                                    ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những
                                    hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy
                                    thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên
                                    nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng
                                    như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa
                                    của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour
                                    Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị
                                    thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch
                                    dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên
                                    xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng -
                                    Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với
                                    những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn
                                    cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và
                                    hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở
                                    cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3
                                    ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những
                                    hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy
                                    thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên
                                    nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng
                                    như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa
                                    của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour
                                    Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị
                                    thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch
                                    dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên
                                    xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng -
                                    Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với
                                    những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn
                                    cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và
                                    hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở
                                    cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3
                                    ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những
                                    hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy
                                    thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên
                                    nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng
                                    như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa
                                    của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour
                                    Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị
                                    thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch
                                    dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên
                                    xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng -
                                    Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với
                                    những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn
                                    cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và
                                    hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở
                                    cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên
                                    xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng -
                                    Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với
                                    những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn
                                    cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và
                                    hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở
                                    cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3
                                    ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những
                                    hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy
                                    thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên
                                    nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng
                                    như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa
                                    của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour
                                    Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị
                                    thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch
                                    dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên
                                    xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng -
                                    Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với
                                    những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn
                                    cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và
                                    hấp dẫn. Trải nghiệm tour du lịch Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm từ TP.HCM sẽ mang đến cho bạn những khám phá đầy thú vị và sự tận hưởng không thể quên tại vùng đất “nắng như rang, gió như phan”. Một số điểm đặc biệt trong Tour Ninh Thuận - Vĩnh Hy 3 ngày 2 đêm: - Khám phá khu du lịch dã ngoại Tanyoli được mệnh danh là vùng đất 300 ngày nắng - Đón bình minh trên đồng cừu An Hòa, chiêm ngưỡng cảnh đàn cừu ra đồng rất đáng yêu và ngộ nghĩnh. - Lạc vào xứ sở
                                    cổ tích tại Hang Rái, khám phá kiến trúc độc đáo của những hang động, vốn được tạo nên từ nhiều hòn đá xếp chồng lên nhau. - Khám phá tháp Pô Klông Garai, biểu tượng văn hóa của đồng bào Chăm, nghe những truyền thuyết xung quanh vị thần tài ba này. - Băng qua tiểu sa mạc cát Mũi Dinh trên xe điện. Hành trình mang đầy tính thách thức, mạo hiểm với những cung đường bụi mù cát, nhưng đảm bảo rất thú vị và hấp dẫn.
                                </p>
                            </div>
                            {showSeeMore && showFullIntro && (
                                <div style={{display: "flex", justifyContent: "center", marginTop: "16px"}} ref={seeMoreRef}>
                                    <div className="see-more-btn" onClick={handleCollapse}>
                                        <i className="fa fa-chevron-up"></i>&nbsp;
                                        <span style={{color: "#1f50ea", cursor: "pointer"}}>Thu gọn</span>
                                    </div>
                                </div>
                            )}

                            {showSeeMore && !showFullIntro && (
                                <div style={{display: "flex", justifyContent: "center", marginTop: "16px"}} ref={seeMoreRef}>
                                    <div className="see-more-btn" onClick={handleExpand}>
                                        <i className="fa fa-chevron-down"></i>&nbsp;
                                        <span style={{color: "#1f50ea", cursor: "pointer"}}>Xem thêm</span>
                                    </div>
                                </div>
                            )}

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
                                        <b>
                                            {item.day}: {item.title} <span>{item.meals}</span>
                                        </b>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div id="tour-terms-section" style={{scrollMarginTop: 120, marginTop: 40}}>
                            <h2>Bao gồm và điều khoản</h2>
                            <div className="tour-accordion">
                                {[
                                    {
                                        title: "Giá tour bao gồm",
                                        icon: <i className="fa-regular fa-circle-check" style={{color: "#1f50ea"}}></i>,
                                        content: tour.includes,
                                    },
                                    {
                                        title: "Giá tour không bao gồm",
                                        icon: <i className="fa-regular fa-circle-xmark" style={{color: "#1f50ea"}}></i>,
                                        content: tour.excludes,
                                    },
                                    {
                                        title: "Chính sách trẻ em",
                                        icon: <i className="fa-solid fa-child" style={{color: "#1f50ea"}}></i>,
                                        content: tour.childrenPolicy,
                                    },
                                    {
                                        title: "Lưu ý",
                                        icon: <i className="fa-solid fa-circle-exclamation" style={{color: "#1f50ea"}}></i>,
                                        content: tour.notes,
                                    },
                                    {
                                        title: "Chính sách hoàn huỷ",
                                        icon: <i className="fa-solid fa-rotate-left" style={{color: "#1f50ea"}}></i>,
                                        content: tour.cancelPolicy,
                                    },
                                ].map((item, idx) => (
                                    <div key={item.title} className="accordion-item">
                                        <div className="accordion-title" onClick={() => setAccordion(accordion === idx ? null : idx)}>
                                            <span>
                                                {item.icon}&nbsp;&nbsp;{item.title}
                                            </span>
                                            <span style={{fontSize: "13px"}}>{accordion === idx ? <i className="fa-solid fa-chevron-up"></i> : <i className="fa-solid fa-chevron-down"></i>}</span>
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
                        <div className="tour-prices">
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

                        <button className="tour-book-btn" style={{width: "100%"}} onClick={() => navigate("/booking")}>
                            Đặt tour ngay
                        </button>
                    </div>
                </div>
            </div>

            {/* Related tours */}
            <div className="tour-related">
                <TourCategory title="Khách hàng còn xem thêm" tours={domesticTours} link="/danh-muc-tour?type=domestic" categoryId="domestic" />
            </div>

            {/* Suggestions */}
            <div className="tour-suggest">
                <h3>Có thể bạn sẽ thích</h3>
                <VietnamGrid destinations={tour.suggestions} />
            </div>
        </div>
    );
}

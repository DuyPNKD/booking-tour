import React, {useEffect} from "react";
import {Link} from "react-router-dom";
import {Swiper, SwiperSlide} from "swiper/react";
import {Autoplay, Pagination, Navigation} from "swiper/modules";
import TourCategory from "../../components/tourCategory/TourCategory";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import haGiang from "../../assets/ha_giang.webp";
import haLong from "../../assets/ha_long.webp";
import hoBaBe from "../../assets/ho_ba_be.webp";
import daNang from "../../assets/da_nang.webp";
import ninhThuan from "../../assets/ninh_thuan.webp";
import mienTay from "../../assets/mien_tay.webp";
import camNang1 from "../../assets/cam_nang_1.webp";
import camNang2 from "../../assets/cam_nang_2.webp";
import camNang3 from "../../assets/cam_nang3.webp";
import camNang4 from "../../assets/cam_nang4.webp";
import food1 from "../../assets/am_thuc1.webp";
import food2 from "../../assets/am_thuc2.webp";
import food3 from "../../assets/am_thuc3.webp";
import food4 from "../../assets/am_thuc4.webp";
import km1 from "../../assets/km1.webp";
import km2 from "../../assets/km2.webp";
import km3 from "../../assets/km3.webp";
import beach from "../../assets/beach.jpg";

import "./Home.css";
import Banner from "../../components/banner/Banner";
import VietnamGrid from "../../components/vietNam/VietnamGrid";

const Home = () => {
    useEffect(() => {
        const handleScroll = () => {
            const navbar = document.querySelector(".navbar");
            const videoBanner = document.querySelector(".video-banner");
            if (navbar && videoBanner) {
                const videoBottom = videoBanner.getBoundingClientRect().bottom;
                if (videoBottom <= 0) {
                    navbar.classList.add("navbar-scrolled");
                } else {
                    navbar.classList.remove("navbar-scrolled");
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Mock data for domestic tours
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

    // Mock data for international tours
    const internationalTours = [
        {
            id: 11,
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
            id: 12,
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
            id: 13,
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
            id: 14,
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
            id: 15,
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
            id: 16,
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
            id: 17,
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
            id: 18,
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
            id: 19,
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
            id: 20,
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

    // Mock data for travel guides
    const travelGuides = [
        {
            id: 1,
            title: "Checkin tại Bãi Sao biển Phú Quốc: Bữa tiệc thiên nhiên đang gọi mời",
            image: camNang1,
            category: "Cẩm nang du lịch",
        },
        {
            id: 2,
            title: "Thành phố Phan Thiết và những thông tin cần biết trước khi du lịch",
            image: camNang2,
            category: "Cẩm nang du lịch",
        },
        {
            id: 3,
            title: "Đảo Ngọc Phú Quốc thiên đường du lịch biển đảo Việt Nam",
            image: camNang3,
            category: "Cẩm nang du lịch",
        },
        {
            id: 4,
            title: "Review khu du lịch Hồ Tràm chi tiết cho team mê xê dịch",
            image: camNang4,
            category: "Cẩm nang du lịch",
        },
    ];

    // Mock data for foods
    const foods = [
        {
            id: 1,
            title: "10 đặc sản Điện Biên ngon không thể cưỡng lại",
            image: food1,
            category: "Cẩm nang du lịch",
        },
        {
            id: 2,
            title: "Cách ít người biết để thưởng thức Food tour Hạ Long",
            image: food2,
            category: "Cẩm nang du lịch",
        },
        {
            id: 3,
            title: "Tổng hợp những quán ăn ngon ở Mù Cang Chải",
            image: food3,
            category: "Cẩm nang du lịch",
        },
        {
            id: 4,
            title: "Danh sách nhà hàng ở đảo Cô Tô, chất lượng tuyệt vời, giá thành phải chăng",
            image: food4,
            category: "Cẩm nang du lịch",
        },
    ];

    // Mock data for banner slides
    const bannerSlides = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1643029891412-92f9a81a8c16?q=80&w=2086&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "Khám phá Việt Nam",
            description: "Hành trình đến những điểm đến tuyệt vời",
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1707817280692-2c711ff06073?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "Du lịch nước ngoài",
            description: "Trải nghiệm văn hóa đa dạng",
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1712035758319-9bfc9ffea604?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "Tour mùa anh đào",
            description: "Ngắm hoa anh đào nở rộ",
        },
    ];

    // Mock data for khuyến mãi

    const promotions = [
        {
            id: 1,
            image: km1,
            title: "Khám phá bãi biển Maldives",
        },
        {
            id: 2,
            image: km2,
            title: "Ưu đãi đặc biệt tại Hawaii",
        },
        {
            id: 3,
            image: km3,
            title: "Tour biển Bali giá cực sốc",
        },
    ];

    // Mock data for promotions
    const trendingTours = [
        {
            id: 1,
            title: "Tour Biển Đảo",
            image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 2,
            title: "Tour Nhật Bản",
            image: "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
        {
            id: 3,
            title: "Tour Trung Quốc",
            image: "https://plus.unsplash.com/premium_photo-1661962892760-5e50359c5123?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
        {
            id: 4,
            title: "Tour Hà Giang",
            image: haGiang,
        },
        {
            id: 5,
            title: "Tour Hạ Long",
            image: haLong,
        },
    ];

    // Dữ liệu cho Khám phá Việt Nam
    const vietnamDestinations = [
        {title: "Hà Giang", image: haGiang, className: "ha-giang"},
        {title: "Hạ Long", image: haLong, className: "ha-long"},
        {title: "Hồ Ba Bể - Thác Bản Giốc", image: hoBaBe, className: "ho-ba-be"},
        {title: "Đà Nẵng", image: daNang, className: "da-nang"},
        {title: "Ninh Thuận", image: ninhThuan, className: "ninh-thuan"},
        {title: "Miền Tây", image: mienTay, className: "mien-tay"},
    ];
    // Dữ liệu cho Vi Vu Nước Ngoài
    const foreignDestinations = [
        {title: "Hàn Quốc", image: "https://images.unsplash.com/photo-1601900245655-7719650f5b7a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", className: "item1"},
        {title: "Ấn Độ", image: "https://images.unsplash.com/photo-1606298855672-3efb63017be8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", className: "item2"},
        {title: "Trung Quốc", image: "https://plus.unsplash.com/premium_photo-1661962892760-5e50359c5123?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", className: "item3"},
        {title: "Nhật Bản", image: "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", className: "item4"},
        {title: "Bali - Indonesia", image: "https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?q=80&w=2006&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", className: "item5"},
        {title: "Thái Lan", image: "https://images.unsplash.com/photo-1707817280692-2c711ff06073?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", className: "item6"},
    ];

    return (
        <>
            <div className="home">
                <div className="home-container">
                    <Banner bannerSlides={bannerSlides} />
                    {/* Promotions Section */}
                    <div className="promotions-section">
                        <div className="category-header">
                            <h2>Chương Trình Khuyến Mãi</h2>
                            <Link to="/travel-guide?category=promotion" className="view-all">
                                <span>Xem thêm</span>
                                <i className="fa-solid fa-circle-chevron-right"></i>
                            </Link>
                        </div>
                        <Swiper
                            modules={[Autoplay]}
                            spaceBetween={20}
                            slidesPerView={3}
                            autoplay={{
                                delay: 3000,
                                disableOnInteraction: false,
                            }}
                            className="promotions-slider"
                        >
                            {promotions.map((promo) => (
                                <SwiperSlide key={promo.id}>
                                    <Link
                                        to={
                                            promo.id === 1 || promo.id === 3
                                                ? "/danh-muc-tour?type=domestic" // Link đến trang trong nước
                                                : "/danh-muc-tour?type=international" // Link đến trang nước ngoài
                                        }
                                        className="promotion-card"
                                    >
                                        <img src={promo.image} alt={promo.title} className="promotion-image" />
                                    </Link>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* Tour Trending */}
                    <div className="trending-tours-section">
                        <div className="container">
                            <h2>Tour Đang Xu Hướng</h2>
                            <div className="trending-tours-grid">
                                {trendingTours.map((tour) => (
                                    <div key={tour.id} className="trending-tour-card">
                                        <img src={tour.image} alt={tour.title} className="trending-tour-image" />
                                        <div className="trending-tour-title">{tour.title}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tour Categories */}
                    <div className="tour-categories">
                        {/* Tour trong nước */}
                        <TourCategory title="Tour HOT Trong Nước Giá Tốt" tours={domesticTours} link="/danh-muc-tour?type=domestic" categoryId="domestic" />

                        {/* Tour nước ngoài */}
                        <TourCategory title="Tour HOT Nước Ngoài Giá Tốt" tours={internationalTours} link="/danh-muc-tour?type=international" categoryId="international" />
                    </div>

                    {/* Khám phá Việt Nam */}
                    <div className="vietnam-section">
                        <h2>Khám Phá Việt Nam</h2>
                        <VietnamGrid destinations={vietnamDestinations} />
                    </div>

                    {/* Vi Vu Nước Ngoài */}
                    <div className="foreign-section">
                        <h2>Vi Vu Nước Ngoài</h2>
                        <VietnamGrid destinations={foreignDestinations} />
                    </div>

                    {/* Cẩm Nang Du Lịch */}
                    <div className="travel-guide-section">
                        <div className="travel-guide-container">
                            {/* Cẩm Nang Du Lịch */}
                            <div className="travel-guide">
                                <div className="category-header">
                                    <h2>Cẩm Nang Du Lịch</h2>
                                    <Link to="/blog?category=travel-guide" className="view-all">
                                        <span>Xem thêm</span>
                                        <i className="fa-solid fa-circle-chevron-right"></i>
                                    </Link>
                                </div>
                                <div className="travel-guide-grid">
                                    {travelGuides.map((guide) => (
                                        <div key={guide.id} className="travel-guide-card">
                                            <img src={guide.image} alt={guide.title} className="travel-guide-image" />
                                            <div className="travel-guide-content">
                                                <p className="travel-guide-title">{guide.title}</p>
                                                <p className="travel-guide-date">
                                                    <i className="fa-regular fa-clock"></i> 06/05/2025
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Ẩm thực */}
                            <div className="foods">
                                <div className="category-header">
                                    <h2>Ẩm thực</h2>
                                    <Link to="/blog?category=foods" className="view-all">
                                        <span>Xem thêm</span>
                                        <i className="fa-solid fa-circle-chevron-right"></i>
                                    </Link>
                                </div>
                                <div className="foods-list">
                                    {foods.map((foods) => (
                                        <div key={foods.id} className="foods-item">
                                            <img src={foods.image} alt={foods.title} className="foods-image" />
                                            <div className="foods-content">
                                                <p className="foods-title">{foods.title}</p>
                                                <p className="foods-date">06/05/2025</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;

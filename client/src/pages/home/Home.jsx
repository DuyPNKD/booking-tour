import React from "react";
import {Link} from "react-router-dom";
import {Swiper, SwiperSlide} from "swiper/react";
import {Autoplay, Pagination, Navigation} from "swiper/modules";
import TourCategory from "../../components/tourCategory/TourCategory";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import "./Home.css";
import Search from "../../components/Search/Search";

const Home = () => {
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
            title: "Kinh nghiệm du lịch Nhật Bản mùa hoa anh đào",
            image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            category: "Cẩm nang du lịch",
        },
        {
            id: 2,
            title: "Top 10 địa điểm check-in tại Đà Lạt",
            image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            category: "Cẩm nang du lịch",
        },
    ];

    // Mock data for banner slides
    const bannerSlides = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1578676030146-86ef415dec0f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "Khám phá Việt Nam",
            description: "Hành trình đến những điểm đến tuyệt vời",
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
            title: "Du lịch nước ngoài",
            description: "Trải nghiệm văn hóa đa dạng",
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
            title: "Tour mùa anh đào",
            description: "Ngắm hoa anh đào nở rộ",
        },
    ];

    return (
        <div className="home">
            <div className="home-container">
                <div className="banner">
                    <div className="custom-prev">
                        <i className="fa-solid fa-chevron-left"></i>
                    </div>
                    <Swiper
                        modules={[Autoplay, Pagination, Navigation]}
                        spaceBetween={10}
                        slidesPerView={1}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                        }}
                        pagination={{clickable: true}}
                        navigation={{
                            prevEl: ".custom-prev",
                            nextEl: ".custom-next",
                        }}
                        loop={true}
                        speed={700}
                    >
                        {bannerSlides.map((slide) => (
                            <SwiperSlide key={slide.id}>
                                <div
                                    className="banner-slide"
                                    style={{
                                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${slide.image})`,
                                    }}
                                >
                                    <div className="banner-content">
                                        <h1>{slide.title}</h1>
                                        <p>{slide.description}</p>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    {/* Nút phải */}
                    <div className="custom-next">
                        <i className="fa-solid fa-chevron-right"></i>
                    </div>
                </div>

                {/* Search Component */}
                <Search />

                {/* Tour Categories */}
                <div className="tour-categories">
                    {/* Tour trong nước */}
                    <TourCategory title="Tour HOT Trong Nước Giá Tốt" tours={domesticTours} link="/tours?type=domestic" />

                    {/* Tour nước ngoài */}
                    <TourCategory title="Tour HOT Nước Ngoài Giá Tốt" tours={internationalTours} link="/tours?type=international" />

                    {/* Cẩm Nang Du Lịch */}
                    <section className="category-section">
                        <div className="category-header">
                            <h2>Cẩm Nang Du Lịch</h2>
                            <Link to="/travel-guide" className="view-all">
                                Xem thêm
                            </Link>
                        </div>
                        <div className="travel-guide-grid">
                            {travelGuides.map((guide) => (
                                <div key={guide.id} className="guide-card">
                                    <img src={guide.image} alt={guide.title} className="guide-image" />
                                    <div className="guide-content">
                                        <span className="guide-category">{guide.category}</span>
                                        <h3>{guide.title}</h3>
                                        <Link to={`/travel-guide/${guide.id}`} className="guide-button">
                                            Đọc thêm
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
            {/* Banner slider */}
        </div>
    );
};

export default Home;

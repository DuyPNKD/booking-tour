import React from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import {Autoplay, Pagination, Navigation} from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./Banner.css";
import Search from "../Search/Search";

const Banner = ({bannerSlides}) => {
    return (
        <div className="banner">
            {/* Nút trái */}
            <div className="banner-prev">
                <i className="fa-solid fa-chevron-left"></i>
            </div>
            <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                spaceBetween={10}
                slidesPerView={1}
                autoplay={{
                    delay: 30000,
                    disableOnInteraction: false,
                }}
                pagination={{clickable: true}}
                navigation={{
                    prevEl: ".banner-prev",
                    nextEl: ".banner-next",
                }}
                loop={true}
                speed={700}
            >
                {bannerSlides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <div
                            className="banner-slide"
                            style={{
                                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url(${slide.image})`,
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
            <div className="banner-next">
                <i className="fa-solid fa-chevron-right"></i>
            </div>

            {/* Search Component */}
            <div className="banner-search">
                <Search />
            </div>
        </div>
    );
};

export default Banner;

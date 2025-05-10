import React, {useRef} from "react";
import {Link} from "react-router-dom";
import {Swiper, SwiperSlide} from "swiper/react";
import {Navigation} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./TourCategory.css";

const TourCategory = ({title, tours, link, categoryId}) => {
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    return (
        <section className="category-section">
            <div className="category-header">
                <h2>{title}</h2>
                <Link to={link} className="view-all">
                    Xem thêm
                    <i className="fa-solid fa-circle-chevron-right"></i>
                </Link>
            </div>

            <div className="slider-container">
                {/* Nút trái - với ID duy nhất */}
                <div className={`custom-prev custom-prev-${categoryId}`} ref={prevRef}>
                    <i className="fa-solid fa-chevron-left"></i>
                </div>

                <Swiper
                    modules={[Navigation]}
                    spaceBetween={20}
                    slidesPerView={3.5}
                    grabCursor={true}
                    navigation={{
                        prevEl: `.custom-prev-${categoryId}`, // Sử dụng class riêng cho từng danh mục
                        nextEl: `.custom-next-${categoryId}`, // Sử dụng class riêng cho từng danh mục
                    }}
                    loop={true}
                    className="tours-slider"
                >
                    {tours.map((tour) => (
                        <SwiperSlide key={tour.id}>
                            <Link to={`/tour/${tour.id}`} className="tourCategory-card">
                                <img src={tour.image} alt={tour.title} className="tourCategory-image" />
                                <div className="tourCategory-content">
                                    <h3 className="tourCategory-title">{tour.title}</h3>
                                    <div className="tourCategory-rating-booked">
                                        <i className="fa-solid fa-star"></i>
                                        <span>
                                            {tour.rating} <span>|</span> {tour.booked}+ đã đặt chỗ
                                        </span>
                                    </div>
                                    <div className="tourCategory-footer">
                                        <div className="tourCategory-infos">
                                            <div className="tourCategory-info-item">
                                                <i className="fa-regular fa-clock"></i>
                                                <span>{tour.duration}</span>
                                            </div>
                                            <div className="tourCategory-info-item">
                                                <i className="fa-solid fa-location-dot"></i>
                                                <span>Điểm đi: {tour.location}</span>
                                            </div>
                                        </div>
                                        <div className="tourCategory-pricing">
                                            <span className="old-price">{tour.oldPrice} đ</span>
                                            <span className="new-price">{tour.price} đ</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Nút phải - với ID duy nhất */}
                <div className={`custom-next custom-next-${categoryId}`} ref={nextRef}>
                    <i className="fa-solid fa-chevron-right"></i>
                </div>
            </div>
        </section>
    );
};

export default TourCategory;

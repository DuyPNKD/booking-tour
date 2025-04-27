import React from "react";
import {Link} from "react-router-dom";
import {Swiper, SwiperSlide} from "swiper/react";
import {Navigation} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./TourCategory.css";

const TourCategory = ({title, tours, link}) => {
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
                {/* Nút trái */}
                <div className="custom-prev">
                    <i className="fa-solid fa-chevron-left"></i>
                </div>

                <Swiper
                    modules={[Navigation]}
                    spaceBetween={20}
                    slidesPerView={3.5}
                    grabCursor={true}
                    navigation={{
                        prevEl: ".custom-prev",
                        nextEl: ".custom-next",
                    }}
                    loop={true}
                    className="tours-slider"
                >
                    {tours.map((tour) => (
                        <SwiperSlide key={tour.id}>
                            <Link to={`/tour/${tour.id}`} className="tour-card">
                                <img src={tour.image} alt={tour.title} className="tour-image" />
                                <div className="tour-content">
                                    <h3 className="tour-title">{tour.title}</h3>
                                    <div className="tour-rating-booked">
                                        <i className="fa-solid fa-star"></i>
                                        <span>
                                            {tour.rating} <span>|</span> {tour.booked}+ đã đặt chỗ
                                        </span>
                                    </div>
                                    <div className="tour-footer">
                                        <div className="tour-infos">
                                            <div className="tour-info-item">
                                                <i className="fa-regular fa-clock"></i>
                                                <span>{tour.duration}</span>
                                            </div>
                                            <div className="tour-info-item">
                                                <i className="fa-solid fa-location-dot"></i>
                                                <span>Điểm đi: {tour.location}</span>
                                            </div>
                                        </div>
                                        <div className="tour-pricing">
                                            <span className="old-price">{tour.oldPrice} đ</span>
                                            <span className="new-price">{tour.price} đ</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Nút phải */}
                <div className="custom-next">
                    <i className="fa-solid fa-chevron-right"></i>
                </div>
            </div>
        </section>
    );
};

export default TourCategory;

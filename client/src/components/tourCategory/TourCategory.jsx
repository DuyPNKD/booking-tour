import React, {useRef, useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {Swiper, SwiperSlide} from "swiper/react";
import {Navigation} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import axios from "axios";
import {Spin, message} from "antd";
import "./TourCategory.css";

const TourCategory = ({title, link, categoryId}) => {
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0); // Thêm state cho slider

    useEffect(() => {
        fetchTours();
    }, [categoryId]);

    const fetchTours = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_API_BASE}/api/tours/by-type?type=${categoryId}`);

            if (response.data.success) {
                setTours(response.data.data);
            } else {
                message.error("Lỗi khi tải danh sách tour");
            }
        } catch (error) {
            console.error("Error fetching tours:", error);
            message.error("Lỗi khi tải danh sách tour");
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    if (loading) {
        return (
            <div className="tour-section">
                <div className="section-header">
                    <h2 className="section-title">{title}</h2>
                </div>
                <div className="loading-container">
                    <Spin size="large" />
                </div>
            </div>
        );
    }
    return (
        <section className="category-section">
            <div className="category-header">
                <h2>{title}</h2>
                <Link to={link} className="view-all">
                    <span>Xem thêm</span>
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
                            <Link to={`/tours/${tour.id}`} className="tourCategory-card">
                                <img src={tour.thumbnail_url} alt={tour.title} className="tourCategory-image" />
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
                                                <span>
                                                    {tour.num_day} ngày {tour.num_night} đêm
                                                </span>
                                            </div>
                                            <div className="tourCategory-info-item">
                                                <i className="fa-solid fa-location-dot"></i>
                                                <span>Điểm đi: {tour.departure_city}</span>
                                            </div>
                                        </div>
                                        <div className="tourCategory-pricing">
                                            <span className="old-price">{formatPrice(tour.old_price)}</span>
                                            {tour.old_price && tour.old_price > tour.price && (
                                                <span className="new-price">{formatPrice(tour.price)}</span>
                                            )}
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

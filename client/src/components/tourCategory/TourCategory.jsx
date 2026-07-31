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
            <section className="category-section">
                <div className="category-header">
                    <h2>{title}</h2>
                    <div className="skeleton-box" style={{width: 90, height: 24}}></div>
                </div>

                <div className="tour-category-skeleton-container" style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginTop: 32}}>
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="tourCategory-card skeleton-card">
                            <div className="skeleton-box" style={{width: "100%", height: 180, borderTopLeftRadius: 12, borderTopRightRadius: 12}}></div>
                            <div className="tourCategory-content" style={{padding: 16}}>
                                <div className="skeleton-box" style={{height: 20, width: "90%", marginBottom: 12}}></div>
                                <div className="skeleton-box" style={{height: 14, width: "50%", marginBottom: 12}}></div>
                                <div className="skeleton-box" style={{height: 14, width: "70%", marginBottom: 16}}></div>
                                <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 8}}>
                                    <div className="skeleton-box" style={{height: 14, width: "35%"}}></div>
                                    <div className="skeleton-box" style={{height: 22, width: "40%"}}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
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
                    breakpoints={{
                        320: { slidesPerView: 1.15, spaceBetween: 12 },
                        576: { slidesPerView: 2.1, spaceBetween: 16 },
                        768: { slidesPerView: 2.8, spaceBetween: 16 },
                        992: { slidesPerView: 3.5, spaceBetween: 20 },
                    }}
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
                                <img 
                                    src={tour.thumbnail_url?.startsWith('/') ? (import.meta.env.VITE_API_BASE + tour.thumbnail_url) : tour.thumbnail_url} 
                                    alt={tour.title} 
                                    className="tourCategory-image" 
                                />
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

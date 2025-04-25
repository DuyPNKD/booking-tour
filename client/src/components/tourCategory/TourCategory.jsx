import React from "react";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleChevronRight} from "@fortawesome/free-solid-svg-icons";
import "./TourCategory.css";

const TourCategory = ({title, tours, link}) => {
    return (
        <section className="category-section">
            <div className="category-header">
                <h2>{title}</h2>
                <Link to={link} className="view-all">
                    Xem thêm
                    <i class="fa-solid fa-circle-chevron-right"></i>
                </Link>
            </div>
            <div className="tours-grid">
                {tours.map((tour) => (
                    <div key={tour.id} className="tour-card">
                        <img src={tour.image} alt={tour.title} className="tour-image" />
                        <div className="tour-content">
                            <h3 className="tour-title">{tour.title}</h3>
                            <div className="tour-details">
                                <span>
                                    <i className="fas fa-clock"></i> {tour.duration}
                                </span>
                            </div>
                            <div className="tour-price">{tour.price} VNĐ</div>
                            <Link to={`/tour/${tour.id}`} className="tour-button">
                                Xem chi tiết
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TourCategory;

import React from "react";
import {Link} from "react-router-dom";
import "./TourCategory.css";

const TourCategory = ({title, tours}) => {
    return (
        <div className="tour-category">
            <div className="category-header">
                <h2 className="category-title">{title}</h2>
                <Link to="/tours" className="view-all">
                    View All
                </Link>
            </div>

            <div className="tour-grid">
                {tours.map((tour) => (
                    <div key={tour.id} className="tour-card">
                        <img src={tour.image} alt={tour.title} className="tour-image" />
                        <div className="tour-content">
                            <h3 className="tour-title">{tour.title}</h3>
                            <p className="tour-duration">{tour.duration}</p>
                            <p className="tour-price">${tour.price}</p>
                            <Link to={`/tour/${tour.id}`} className="detail-button">
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TourCategory;

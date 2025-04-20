import React from "react";
import "./SearchBox.css";

const SearchBox = () => {
    const destinations = [{label: "Hà Nội"}, {label: "Đà Nẵng"}, {label: "Hồ Chí Minh"}, {label: "Nha Trang"}, {label: "Phú Quốc"}, {label: "Đà Lạt"}];

    return (
        <div className="search-box">
            <div className="search-grid">
                <div className="search-field">
                    <i className="fas fa-map-marker-alt"></i>
                    <select>
                        <option value="">Điểm đến</option>
                        {destinations.map((dest) => (
                            <option key={dest.label} value={dest.label}>
                                {dest.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="search-field">
                    <i className="fas fa-calendar"></i>
                    <input type="date" />
                </div>

                <div className="search-field">
                    <i className="fas fa-users"></i>
                    <input type="number" min="1" placeholder="Số người" />
                </div>

                <button className="search-button">
                    <i className="fas fa-search"></i> Tìm kiếm
                </button>
            </div>
        </div>
    );
};

export default SearchBox;

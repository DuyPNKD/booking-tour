import React from "react";
import "./VietNamGrid.css";
/**
 * VietnamGrid component
 * @param {Array} destinations - Mảng các điểm đến, mỗi điểm: { image, title, className }
 */

const VietnamGrid = ({destinations}) => {
    return (
        <div className="vietnam-grid">
            {(Array.isArray(destinations) ? destinations : []).map((item, idx) => (
                <div key={item.title + idx} className={`vietnam-card${item.className ? " " + item.className : ""}`}>
                    <img src={item.image} alt={item.title} className="vietnam-image" />
                    <div className="vietnam-title">{item.title}</div>
                </div>
            ))}
        </div>
    );
};

export default VietnamGrid;

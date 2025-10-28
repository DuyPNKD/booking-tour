import React from "react";
import "./VietNamGrid.css";
import {Link} from "react-router-dom";
/**
 * VietnamGrid component
 * @param {Array} destinations - Mảng các điểm đến, mỗi điểm: { image, title, className }
 */

const VietnamGrid = ({destinations}) => {
    const list = Array.isArray(destinations) ? destinations : [];
    return (
        <div className="vietnam-grid">
            {list.map((item, idx) => {
                const cardClass = `vietnam-card${item.className ? " " + item.className : ""}`;
                const content = (
                    <>
                        <img src={item.image} alt={item.title} className="vietnam-image" />
                        <div className="vietnam-title">{item.title}</div>
                    </>
                );

                // Preserve exact DOM structure / layout: wrap with Link only if item.link exists,
                // otherwise keep as a plain div so CSS/layout stays the same.
                return item && item.link ? (
                    <Link key={idx} to={item.link} className={cardClass} aria-label={item.title}>
                        {content}
                    </Link>
                ) : (
                    <div key={idx} className={cardClass}>
                        {content}
                    </div>
                );
            })}
        </div>
    );
};

export default VietnamGrid;

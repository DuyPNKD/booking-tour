import React from "react";

const Pagination = ({currentPage, totalPages, onPageChange}) => {
    if (!totalPages || totalPages <= 1) return null;

    const handlePrev = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    const renderPages = () => {
        const pages = [];
        const maxButtons = 5;
        let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let end = start + maxButtons - 1;
        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - maxButtons + 1);
        }

        if (start > 1) {
            pages.push(
                <button key={1} className={currentPage === 1 ? "pg-active" : ""} onClick={() => onPageChange(1)}>
                    1
                </button>
            );
            if (start > 2)
                pages.push(
                    <span key="start-ellipsis" className="pg-ellipsis">
                        …
                    </span>
                );
        }

        for (let i = start; i <= end; i++) {
            pages.push(
                <button key={i} className={currentPage === i ? "pg-active" : ""} onClick={() => onPageChange(i)}>
                    {i}
                </button>
            );
        }

        if (end < totalPages) {
            if (end < totalPages - 1)
                pages.push(
                    <span key="end-ellipsis" className="pg-ellipsis">
                        …
                    </span>
                );
            pages.push(
                <button key={totalPages} className={currentPage === totalPages ? "pg-active" : ""} onClick={() => onPageChange(totalPages)}>
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="pagination">
            <button className="pg-nav" onClick={handlePrev} disabled={currentPage === 1}>
                <i className="fa-solid fa-chevron-left"></i>
            </button>
            {renderPages()}
            <button className="pg-nav" onClick={handleNext} disabled={currentPage === totalPages}>
                <i className="fa-solid fa-chevron-right"></i>
            </button>
        </div>
    );
};

export default Pagination;

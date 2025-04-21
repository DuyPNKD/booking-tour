import React, {useState, useRef, useEffect} from "react";
import {Link} from "react-router-dom";
import "./Search.css";
import goiy1 from "../../assets/goiy1.webp";
import goiy2 from "../../assets/goiy2.webp";
import banner1 from "../../assets/banner1.webp";
import banner2 from "../../assets/banner2.webp";

const Search = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef(null);
    const searchInputRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearchClick = () => {
        if (!isSearchOpen) {
            setIsSearchOpen(true);
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 0);
        }
    };

    const popularTours = [
        {
            id: 1,
            title: "Tour Mộc Châu khám phá mảnh đất bốn mùa nở hoa 2 ngày 1 đêm từ Hà Nội",
            duration: "2 ngày 1 đêm",
            price: "1.880.000đ",
            image: goiy1,
        },
        {
            id: 2,
            title: "Tour Hà Giang - Sông Nho Quế 4 ngày 4 đêm từ TP.HCM: Trải nghiệm văn hóa miền đá",
            duration: "4 ngày 4 đêm",
            price: "7.180.000đ",
            image: goiy2,
        },
    ];

    const featuredDestinations = [
        {
            id: 1,
            title: "Tour Trung Quốc: Thành Đô - Cửu Trại Câu - Trượt tuyết Gia Cô Sơn - Đỗ Giang Yến 6 ngày 5 đêm từ Hà Nội",
            duration: "6 ngày 5 đêm",
            price: "14.990.000đ",
            image: goiy1,
        },
        {
            id: 2,
            title: "Tour Trung Quốc: Trường Gia Giới - Phượng Hoàng Cổ Trấn 5 ngày 4 đêm từ Hà Nội - Bay Vietjet Air",
            duration: "5 ngày 4 đêm",
            price: "11.490.000đ",
            image: goiy2,
        },
    ];

    return (
        <div className="search-container" ref={searchRef}>
            <div className="search-box" onClick={handleSearchClick}>
                <div className="search-input">
                    <i className="fas fa-map-marker-alt"></i>
                    <input ref={searchInputRef} type="text" placeholder="Bạn muốn đi đâu?" />
                </div>
                <button className="search-submit">
                    <i className="fas fa-search"></i>
                    Tìm tour
                </button>
            </div>

            {/* Search Dropdown */}
            {isSearchOpen && (
                <div className="search-dropdown">
                    <div className="popular-tags">
                        <Link to="/tour/le-30-4" className="tag">
                            Tour Lễ 30/4
                        </Link>
                        <Link to="/tour/trung-quoc" className="tag">
                            Tour Trung Quốc
                        </Link>
                        <Link to="/tour/nhat-ban" className="tag">
                            Tour Nhật Bản
                        </Link>
                        <Link to="/tour/dong-tay-bac" className="tag">
                            Tour Đông Tây Bắc
                        </Link>
                        <Link to="/tour/han-quoc" className="tag">
                            Tour Hàn Quốc
                        </Link>
                    </div>

                    <div className="search-sections">
                        <div className="search-section">
                            <h2>Tour được tìm nhiều nhất</h2>
                            <div className="tour-list">
                                {popularTours.map((tour) => (
                                    <div key={tour.id} className="tour-item">
                                        <img src={tour.image} alt={tour.title} />
                                        <div className="tour-info">
                                            <span>{tour.title}</span>
                                            <div className="tour-meta">
                                                <span className="duration">
                                                    <i className="fas fa-clock"></i> {tour.duration}
                                                </span>
                                            </div>
                                            <div className="tour-price">
                                                Chỉ từ <span>{tour.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="search-section">
                            <h2>Điểm đến nổi bật</h2>
                            <div className="tour-list">
                                {featuredDestinations.map((tour) => (
                                    <div key={tour.id} className="tour-item">
                                        <img src={tour.image} alt={tour.title} />
                                        <div className="tour-info">
                                            <span>{tour.title}</span>
                                            <div className="tour-meta">
                                                <span className="duration">
                                                    <i className="fas fa-clock"></i> {tour.duration}
                                                </span>
                                            </div>
                                            <div className="tour-price">
                                                Chỉ từ <span>{tour.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Search;

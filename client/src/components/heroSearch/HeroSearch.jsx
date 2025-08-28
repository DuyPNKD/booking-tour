import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMapMarkerAlt, faCalendar, faPaperPlane, faFlag} from "@fortawesome/free-solid-svg-icons";
import {DatePicker} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import locale from "antd/es/date-picker/locale/vi_VN";
import {Select} from "antd";
import axios from "axios";

import "./HeroSearch.css";

const HeroSearch = () => {
    const [destination, setDestination] = useState("");
    const [departureDate, setDepartureDate] = useState("");
    const [departureFrom, setDepartureFrom] = useState("Hà Nội");
    const [departureCities, setDepartureCities] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
    const typingTimeoutRef = useRef(null);

    const destinationFieldRef = useRef(null);
    const navigate = useNavigate();

    const searchHistory = [
        "Tour Nhật Bản 4N4Đ: Tokyo - Kyoto",
        "Tour Singapore - Malaysia",
        "Tour Trung Quốc 5N4Đ: Hàng Châu - Tô Châu",
        "Tour Liên Tuyến Ba Nước Đông Dương",
        "Tour Bình Hưng 2N2Đ: Ninh Thuận",
        "Tour Singapore - Malaysia",
    ];

    const hotDestinations = [
        {name: "Úc", count: 7, image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800"}, // Sydney Opera House
        {
            name: "Châu Âu",
            count: 34,
            image: "https://plus.unsplash.com/premium_photo-1661963064037-cfcf2e10db2d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        }, // Eiffel Tower
        {
            name: "Singapore",
            count: 30,
            image: "https://images.unsplash.com/photo-1533281808624-e9b07b4294ff?q=80&w=1026&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        }, // Marina Bay Sands
        {name: "Thái Lan", count: 26, image: "https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=800"}, // Wat Arun
        {
            name: "Miền Bắc",
            count: 10,
            image: "https://images.unsplash.com/photo-1643029891412-92f9a81a8c16?q=80&w=2086&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        }, // Ha Long Bay
        {
            name: "Đà Nẵng",
            count: 27,
            image: "https://images.unsplash.com/photo-1663684591502-93887202a863?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        }, // Golden Bridge
        {name: "Trung Quốc", count: 132, image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800"}, // Great Wall
        {
            name: "Nhật Bản",
            count: 43,
            image: "https://plus.unsplash.com/premium_photo-1661878091370-4ccb8763756a?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        }, // Tokyo/Cherry blossoms
        {
            name: "Bali",
            count: 8,
            image: "https://images.unsplash.com/photo-1704253411612-e4deb715dcd8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        }, // Bali temple
        {name: "Hàn Quốc", count: 25, image: "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?q=80&w=800"}, // Seoul palace
        {
            name: "Phú Quốc",
            count: 14,
            image: "https://images.unsplash.com/photo-1587772495731-909d40b30851?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        }, // Phu Quoc beach
        {name: "Mỹ", count: 5, image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800"}, // NYC skyline
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (destinationFieldRef.current && !destinationFieldRef.current.contains(event.target)) {
                setShowDestinationDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch API khi component mount
    useEffect(() => {
        const fetchDepartureCities = async () => {
            try {
                const res = await axios.get("http://localhost:3000/api/tours/departure-cities");
                // API trả về mảng ["Hà Nội", "Hồ Chí Minh", ...]
                const options = res.data.map((city) => ({
                    value: city,
                    label: city,
                }));
                setDepartureCities(options);
            } catch (error) {
                console.error("Lỗi khi fetch departure cities:", error);
            }
        };

        fetchDepartureCities();
    }, []);

    // Gọi API suggest khi gõ
    useEffect(() => {
        if (destination.length < 2) {
            setSuggestions([]);
            return;
        }

        // Clear timeout nếu người dùng tiếp tục gõ
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout mới: gọi API sau 2.5s
        typingTimeoutRef.current = setTimeout(async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/tours/suggest?q=${encodeURIComponent(destination)}`);
                setSuggestions(res.data);
                setShowDestinationDropdown(true);
            } catch (error) {
                console.error("Lỗi suggest:", error);
            }
        }, 1500); // 1500ms = 1.5s

        // Clean up
        return () => clearTimeout(typingTimeoutRef.current);
    }, [destination]);

    const handleSelect = (slug) => {
        navigate(`/danh-muc-tour?search=${slug}`);
        setShowDestinationDropdown(false);
        setDestination(slug);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams({
            destination: destination || "",
            startDate: departureDate ? dayjs(departureDate).format("YYYY-MM-DD") : "",
            departure: departureFrom || "",
        });
        navigate(`/danh-muc-tour?${params.toString()}`);
        setShowDestinationDropdown(false);
    };

    const handleInputChange = (e) => {
        setDestination(e.target.value);
    };
    return (
        <div className="hero-search">
            <div className="hero-search-wrapper">
                <div className="hero-search-headline">
                    <h2 className="hero-search-title">Hơn 1000+ Tour, khám phá ngay</h2>
                    <p className="hero-search-subtitle">Giá tốt - hỗ trợ 24/7 - Khắp nơi</p>
                </div>

                <div className="hero-search-content">
                    <div className="hero-search-left">
                        <form onSubmit={handleSearch} className="search-form">
                            <div className="search-row">
                                <div className="search-field destination-field" ref={destinationFieldRef}>
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="field-icon" />
                                    <input
                                        type="text"
                                        placeholder="Bạn muốn đi đâu?"
                                        value={destination}
                                        onChange={handleInputChange}
                                        onFocus={() => setShowDestinationDropdown(true)}
                                    />
                                    {showDestinationDropdown && (
                                        <div className="destination-dropdown">
                                            {/* Suggestions API */}
                                            {suggestions.length > 0 && (
                                                <div className="suggestions-list">
                                                    <div className="suggestions-header">Danh sách tour</div>
                                                    {suggestions.slice(0, 5).map((tour) => {
                                                        const regex = new RegExp(`(${destination})`, "gi"); // tìm chữ trùng
                                                        const parts = tour.title.split(regex); // tách chuỗi
                                                        return (
                                                            <div key={tour.id} className="suggest-item" onClick={() => handleSelect(tour.slug)}>
                                                                <FontAwesomeIcon icon={faFlag} className="suggest-icon" />
                                                                <div className="suggest-text">
                                                                    {parts.map((part, idx) =>
                                                                        part.toLowerCase() === destination.toLowerCase() ? (
                                                                            <span key={idx} className="highlight">
                                                                                {part}
                                                                            </span>
                                                                        ) : (
                                                                            part
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    {suggestions.length > 5 && (
                                                        <button
                                                            type="button"
                                                            className="suggestions-more"
                                                            onClick={() => {
                                                                navigate(`/danh-muc-tour?search=${encodeURIComponent(destination)}`);
                                                                setShowDestinationDropdown(false);
                                                            }}
                                                        >
                                                            Toàn bộ kết quả
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Lịch sử tìm kiếm */}
                                            {suggestions.length === 0 && (
                                                <div className="dropdown-section-top">
                                                    <div className="dropdown-title">Lịch sử tìm kiếm</div>
                                                    <div className="history-chips">
                                                        {searchHistory.map((item, idx) => (
                                                            <button key={idx} type="button" className="chip" onClick={() => setDestination(item)}>
                                                                {item}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Địa điểm hot */}
                                            {suggestions.length === 0 && (
                                                <div className="dropdown-section-bottom">
                                                    <div className="dropdown-title">ĐỊA ĐIỂM HOT</div>
                                                    <div className="hot-grid">
                                                        {hotDestinations.map((d) => (
                                                            <div
                                                                key={d.name}
                                                                type="button"
                                                                className="hot-item"
                                                                onClick={() => setDestination(d.name)}
                                                            >
                                                                <img src={d.image} alt={d.name} />
                                                                <div className="hot-meta">
                                                                    <div className="hot-name">{d.name}</div>
                                                                    <div className="hot-count">{d.count} tours</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="search-row">
                                {/* Ô chọn ngày khởi hành */}
                                <div className="search-field date-field">
                                    <FontAwesomeIcon icon={faCalendar} className="field-icon" />
                                    <div className="field-content">
                                        <div className="field-label">Ngày khởi hành</div>
                                        <DatePicker
                                            value={departureDate}
                                            onChange={(date) => setDepartureDate(date)}
                                            format="DD/MM/YYYY"
                                            placeholder="Chọn ngày"
                                            locale={locale}
                                            style={{border: "none", padding: 0, fontSize: "16px"}}
                                            suffixIcon={null}
                                            allowClear={false}
                                            placement="bottomLeft" // 👈 Canh popup xuất hiện từ bên trái
                                        />
                                    </div>
                                </div>

                                <div className="search-field departure-field">
                                    <FontAwesomeIcon icon={faPaperPlane} className="field-icon" />
                                    <div className="field-content">
                                        {/* label luôn hiển thị */}
                                        <div className="field-label">Khởi hành từ</div>

                                        {/* Select chỉ hiển thị value */}
                                        <div className="field-value">{departureFrom}</div>
                                        <Select
                                            value={departureFrom}
                                            onChange={(value) => setDepartureFrom(value)}
                                            bordered={false}
                                            className="departure-select"
                                            suffixIcon={null}
                                            dropdownMatchSelectWidth={true}
                                            placement="bottomLeft" // 👈 cho phép dropdown rộng tùy chỉnh // 👈 khớp 100% width theo Select cha
                                            options={departureCities}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="search-button">
                                    Tìm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSearch;

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
    const [departureDate, setDepartureDate] = useState(null);
    const [departureFrom, setDepartureFrom] = useState("Hà Nội");
    const [departureCities, setDepartureCities] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
    const typingTimeoutRef = useRef(null);

    const destinationFieldRef = useRef(null);
    const dateFieldRef = useRef(null);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isDepartureSelectOpen, setIsDepartureSelectOpen] = useState(false);
    const navigate = useNavigate();

    // Lưu mảng từ khóa đã tìm (render ra các chip lịch sử)
    const [searchHistory, setSearchHistory] = useState([]);
    // Tên key trong localStorage để lưu lịch sử tìm kiếm
    const HISTORY_KEY = "heroSearch.history";
    // Số lượng mục tối đa sẽ lưu trong lịch sử
    const MAX_HISTORY = 10;

    // Danh sách "ĐỊA ĐIỂM HOT" lấy từ API và trạng thái loading
    const [hotDestinations, setHotDestinations] = useState([]);
    const [loadingHot, setLoadingHot] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (destinationFieldRef.current && !destinationFieldRef.current.contains(event.target)) {
                setShowDestinationDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Đóng DatePicker khi click ra ngoài cả field và dropdown panel
    useEffect(() => {
        const onDocMouseDown = (e) => {
            if (!isDatePickerOpen) return;
            const isInField = dateFieldRef.current && dateFieldRef.current.contains(e.target);
            const dropdown = document.querySelector(".ant-picker-dropdown");
            const isInDropdown = dropdown && dropdown.contains(e.target);
            if (!isInField && !isInDropdown) {
                setIsDatePickerOpen(false);
            }
        };
        document.addEventListener("mousedown", onDocMouseDown);
        return () => document.removeEventListener("mousedown", onDocMouseDown);
    }, [isDatePickerOpen]);

    // Load history on mount
    useEffect(() => {
        // 1) Đọc dữ liệu thô từ localStorage theo key HISTORY_KEY
        try {
            const raw = localStorage.getItem(HISTORY_KEY);
            // 2) Nếu có dữ liệu, parse JSON; nếu không thì dùng mảng rỗng
            const parsed = raw ? JSON.parse(raw) : [];
            // 3) Chỉ nhận dữ liệu hợp lệ là mảng
            setSearchHistory(Array.isArray(parsed) ? parsed : []);
        } catch (_) {
            // 4) Nếu JSON lỗi/không hợp lệ → đặt lịch sử rỗng để an toàn
            setSearchHistory([]);
        }
    }, []);

    // Thêm một từ khóa mới vào lịch sử (đẩy lên đầu, loại trùng, giới hạn MAX_HISTORY)
    const addHistory = (term) => {
        // 1) Chuẩn hóa: ép về chuỗi, trim khoảng trắng đầu/cuối
        const t = (term || "").trim();
        // 2) Nếu rỗng thì bỏ qua
        if (!t) return;
        // 3) Cập nhật state dựa trên state trước đó
        setSearchHistory((prev) => {
            // 3.1) Loại trùng: bỏ các mục có nội dung giống (không phân biệt hoa/thường)
            const noDup = prev.filter((x) => x.toLowerCase() !== t.toLowerCase());
            // 3.2) Thêm từ khóa mới lên đầu, cắt còn tối đa MAX_HISTORY mục
            const next = [t, ...noDup].slice(0, MAX_HISTORY);
            try {
                // 3.3) Lưu lại xuống localStorage để lần sau mở trang vẫn còn
                localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
            } catch (_) {
                // Trường hợp quota localStorage đầy hoặc user tắt storage
            }
            // 3.4) Trả về mảng lịch sử mới để React setState
            return next;
        });
    };

    // Xóa một từ khóa cụ thể khỏi lịch sử (khi bấm icon × trên chip)
    const removeHistory = (term) => {
        setSearchHistory((prev) => {
            // 1) Tạo mảng mới không còn phần tử cần xóa
            const next = prev.filter((x) => x.toLowerCase() !== (term || "").toLowerCase());
            try {
                // 2) Lưu mảng mới xuống localStorage
                localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
            } catch (_) {
                // Bỏ qua lỗi ghi storage nếu có
            }
            // 3) Trả về state mới
            return next;
        });
    };

    // Fetch API khi component mount
    useEffect(() => {
        const fetchDepartureCities = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
                const res = await axios.get(`${API_BASE}/api/tours/departure-cities`);
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
                const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
                const res = await axios.get(`${API_BASE}/api/tours/suggest?q=${encodeURIComponent(destination)}`);
                setSuggestions(res.data);
                setShowDestinationDropdown(true);
            } catch (error) {
                console.error("Lỗi suggest:", error);
            }
        }, 1500); // 1500ms = 1.5s

        // Clean up
        return () => clearTimeout(typingTimeoutRef.current);
    }, [destination]);

    // Fetch hot destinations một lần khi mount (có cache sessionStorage)
    useEffect(() => {
        const fetchHot = async () => {
            try {
                setLoadingHot(true);
                const cache = sessionStorage.getItem("heroSearch.hot");
                if (cache) {
                    const parsed = JSON.parse(cache);
                    if (Array.isArray(parsed)) {
                        setHotDestinations(parsed);
                        setLoadingHot(false);
                        return;
                    }
                }
                const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
                const res = await axios.get(`${API_BASE}/api/tours/hot-destinations`);
                const list = Array.isArray(res.data) ? res.data : [];
                setHotDestinations(list);
                try {
                    sessionStorage.setItem("heroSearch.hot", JSON.stringify(list));
                } catch (_) {}
            } catch (e) {
                setHotDestinations([]);
            } finally {
                setLoadingHot(false);
            }
        };
        fetchHot();
    }, []);

    const handleSelect = (tour) => {
        addHistory(tour.title);
        navigate(`/tours/${tour.id}`);
        setShowDestinationDropdown(false);
        setDestination(tour.title);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        addHistory(destination);
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
                                                            <div key={tour.id} className="suggest-item" onClick={() => handleSelect(tour)}>
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
                                                                const params = new URLSearchParams({
                                                                    destination: destination || "",
                                                                    startDate: departureDate ? dayjs(departureDate).format("YYYY-MM-DD") : "",
                                                                    departure: departureFrom || "",
                                                                }).toString();
                                                                navigate(`/danh-muc-tour?${params}`);
                                                                setShowDestinationDropdown(false);
                                                            }}
                                                        >
                                                            Toàn bộ kết quả
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {
                                                /* Lịch sử tìm kiếm */
                                                // Khi không có gợi ý (suggestions.length === 0), hiển thị phần lịch sử
                                            }
                                            {suggestions.length === 0 && (
                                                <div className="dropdown-section-top">
                                                    {/* Tiêu đề phần lịch sử */}
                                                    <div className="dropdown-title">Lịch sử tìm kiếm</div>
                                                    <div className="history-chips">
                                                        {/* Duyệt qua từng mục lịch sử và render thành chip */}
                                                        {searchHistory.map((item, idx) => (
                                                            <button key={idx} type="button" className="chip" onClick={() => setDestination(item)}>
                                                                {/* Text trong chip: có ellipsis nếu dài */}
                                                                <span className="chip-text">{item}</span>
                                                                <span
                                                                    className="chip-close"
                                                                    onClick={(e) => {
                                                                        // Chặn nổi bọt để tránh trigger onClick của chip
                                                                        e.stopPropagation();
                                                                        // Xóa riêng mục lịch sử này
                                                                        removeHistory(item);
                                                                    }}
                                                                    aria-label="Xóa"
                                                                >
                                                                    ×
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Địa điểm hot: danh sách điểm đến nổi bật, click sẽ điều hướng sang trang danh sách với bộ lọc hiện tại */}
                                            {suggestions.length === 0 && (
                                                <div className="dropdown-section-bottom">
                                                    <div className="dropdown-title">ĐỊA ĐIỂM HOT</div>
                                                    <div className="hot-grid">
                                                        {loadingHot && <div className="hot-item">Đang tải...</div>}
                                                        {!loadingHot &&
                                                            hotDestinations.map((d) => (
                                                                <div
                                                                    key={d.name}
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    className="hot-item"
                                                                    onClick={() => {
                                                                        addHistory(d.name);
                                                                        const params = new URLSearchParams({
                                                                            destination: d.name || "",
                                                                            startDate: departureDate ? dayjs(departureDate).format("YYYY-MM-DD") : "",
                                                                            departure: departureFrom || "",
                                                                        }).toString();
                                                                        navigate(`/danh-muc-tour?${params}`);
                                                                        setShowDestinationDropdown(false);
                                                                    }}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === "Enter") {
                                                                            const params = new URLSearchParams({
                                                                                destination: d.name || "",
                                                                                startDate: departureDate
                                                                                    ? dayjs(departureDate).format("YYYY-MM-DD")
                                                                                    : "",
                                                                                departure: departureFrom || "",
                                                                            }).toString();
                                                                            navigate(`/danh-muc-tour?${params}`);
                                                                            setShowDestinationDropdown(false);
                                                                        }
                                                                    }}
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
                                <div
                                    className="search-field date-field"
                                    ref={dateFieldRef}
                                    onMouseDown={(e) => {
                                        // Ngăn focus/blur mặc định khiến popup tự mở/đóng lập tức
                                        e.preventDefault();
                                        setIsDatePickerOpen((prev) => !prev);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faCalendar} className="field-icon" />
                                    <div className="field-content">
                                        <div className="field-label">Ngày khởi hành</div>
                                        <DatePicker
                                            value={departureDate}
                                            onChange={(date) => {
                                                setDepartureDate(date);
                                                // Đóng sau khi chọn ngày để tránh bật/tắt ngay lập tức
                                                setIsDatePickerOpen(false);
                                            }}
                                            format="DD/MM/YYYY"
                                            placeholder="Chọn ngày"
                                            locale={locale}
                                            style={{border: "none", padding: 0, fontSize: "16px"}}
                                            suffixIcon={null}
                                            allowClear={false}
                                            placement="bottomLeft" // 👈 Canh popup xuất hiện từ bên trái
                                            open={isDatePickerOpen}
                                        />
                                    </div>
                                </div>

                                <div
                                    className="search-field departure-field"
                                    onMouseDown={(e) => {
                                        // Tránh blur làm dropdown đóng ngay
                                        e.preventDefault();
                                        setIsDepartureSelectOpen((prev) => !prev);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faPaperPlane} className="field-icon" />
                                    <div className="field-content">
                                        {/* label luôn hiển thị */}
                                        <div className="field-label">Khởi hành từ</div>

                                        {/* Select chỉ hiển thị value */}
                                        <div className="field-value">{departureFrom}</div>
                                        <Select
                                            value={departureFrom}
                                            onChange={(value) => {
                                                setDepartureFrom(value);
                                                // Chủ động đóng sau khi chọn để tránh flicker
                                                setIsDepartureSelectOpen(false);
                                            }}
                                            variant="outlined" // hoặc "filled", "borderless" tùy nhu cầu
                                            className="departure-select"
                                            suffixIcon={null}
                                            popupMatchSelectWidth={false} // hoặc true, tùy nhu cầu
                                            placement="bottomLeft" // 👈 cho phép dropdown rộng tùy chỉnh // 👈 khớp 100% width theo Select cha
                                            options={departureCities}
                                            open={isDepartureSelectOpen}
                                            styles={{
                                                popup: {
                                                    root: {
                                                        /* style ở đây */
                                                    },
                                                },
                                            }}
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

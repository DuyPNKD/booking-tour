import React, {useEffect, useRef, useState} from "react";
import Calendar from "react-calendar";
import axios from "axios";
import "react-calendar/dist/Calendar.css";
import "./Calendar.css";

const CustomCalendarInput = ({tourId, onChange, value}) => {
    const [departureDates, setDepartureDates] = useState([]);
    const [showCalendar, setShowCalendar] = useState(false);

    const calendarRef = useRef();

    // Lấy danh sách ngày khởi hành từ API
    useEffect(() => {
        const fetchDates = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/tours/${tourId}/departure-dates`);
                setDepartureDates(res.data || []);
                if (res.data.length > 0) {
                    onChange(res.data[0]); // ✅ Gọi callback để update selectedDate ở component cha
                }
            } catch (err) {
                console.error("Lỗi khi lấy ngày khởi hành:", err);
            }
        };
        fetchDates();
    }, [tourId]);

    // Đóng lịch khi click ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (calendarRef.current && !calendarRef.current.contains(e.target)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const formatDate = (date) => {
        console.log("👉 formatDate:", date);
        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
    };

    const handleSelect = (date) => {
        const isoDate = date.toISOString().split("T")[0];
        if (departureDates.includes(isoDate)) {
            setShowCalendar(false);
            if (onChange) onChange(isoDate); // 💥 Thêm dòng này để truyền ra ngoài
        }
    };

    const parseDateFromISO = (input) => {
        if (!input) return null;

        // Nếu là Date object rồi thì trả lại luôn
        if (input instanceof Date) return input;

        // Nếu là string "yyyy-mm-dd"
        if (typeof input === "string") {
            const [y, m, d] = input.split("-").map(Number);
            return new Date(y, m - 1, d);
        }

        return null;
    };

    return (
        <div ref={calendarRef} style={{position: "relative"}}>
            {/* Input lịch */}
            <div
                onClick={() => setShowCalendar((prev) => !prev)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    padding: "4px 10px",
                    background: "#fff",
                    cursor: "pointer",
                    minWidth: 130,
                    minHeight: 50,
                    justifyContent: "center",
                }}
            >
                <i className="fa-regular fa-calendar" style={{marginRight: 6, color: "#1f50ea"}}></i>
                <span>Xem lịch</span>
            </div>

            {/* Bảng lịch hiển thị dưới input */}
            {showCalendar && (
                <div
                    style={{
                        position: "absolute",
                        top: "110%",
                        right: 0,
                        zIndex: 10,
                        background: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: 8,
                        boxShadow: "0 0 6px rgba(0,0,0,0.1)",
                    }}
                >
                    <Calendar
                        value={value ? parseDateFromISO(value) : null}
                        tileClassName={({date, view}) => {
                            if (view !== "month") return null;

                            const isoDate = date.toISOString().split("T")[0];

                            const isValid = departureDates.includes(isoDate);
                            const isSelected = value && new Date(value).toISOString().split("T")[0] === isoDate;

                            if (!isValid) return "disabled-day";
                            if (isSelected) return "departure-day selected-day";
                            return "departure-day";
                        }}
                        tileDisabled={({date}) => {
                            const isoDate = date.toISOString().split("T")[0];
                            return !departureDates.includes(isoDate);
                        }}
                        onClickDay={handleSelect}
                    />
                </div>
            )}
        </div>
    );
};

export default CustomCalendarInput;

import React, {useState} from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendar.css"; // Import custom styles for the calendar

// giả lập danh sách ngày có tour (YYYY-MM-DD)
const departureDates = ["2025-06-15", "2025-06-17", "2025-06-22", "2025-07-01"];

const CustomCalendar = () => {
    const [value, setValue] = useState(new Date());

    const isDepartureDate = (date) => {
        const formatted = date.toISOString().split("T")[0];
        return departureDates.includes(formatted);
    };

    return (
        <div className="calendar-wrapper">
            <Calendar onChange={setValue} value={value} tileClassName={({date, view}) => (view === "month" && isDepartureDate(date) ? "departure-day" : null)} />
        </div>
    );
};

export default CustomCalendar;

import React, { useState, useEffect } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

const Calendar = ({ setActiveDay, setCurrentDate, events }) => {
    const [today, setToday] = useState(new Date());
    const [activeDate, setActiveDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState({
        month: today.getMonth(),
        year: today.getFullYear(),
    });

    const getMonthName = (month) =>
        new Date(currentMonth.year, month).toLocaleString("default", { month: "long" });

    const hasEvents = (day) => {
        return events.some((event) => {
            const eventDate = new Date(event.start.dateTime);
            return (
                eventDate.getDate() === day &&
                eventDate.getMonth() === currentMonth.month &&
                eventDate.getFullYear() === currentMonth.year
            );
        });
    };

    const renderDays = () => {
        const firstDay = new Date(currentMonth.year, currentMonth.month, 1).getDay();
        const lastDate = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();

        const prevMonthLastDate = new Date(currentMonth.year, currentMonth.month, 0).getDate();
        const nextMonthFirstDate = 1;

        const days = [];

        // Add days from the previous month
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push(
                <div
                    key={`prev-${i}`}
                    className="day prev-date"
                    onClick={() => {
                        setActiveDate(new Date(currentMonth.year, currentMonth.month - 1, prevMonthLastDate - i));
                        setActiveDay(prevMonthLastDate - i);
                        setCurrentDate(new Date(currentMonth.year, currentMonth.month - 1, prevMonthLastDate - i));
                    }}
                >
                    {prevMonthLastDate - i}
                </div>
            );
        }

        // Add actual days of the current month
        for (let day = 1; day <= lastDate; day++) {
            const isToday =
                day === today.getDate() &&
                currentMonth.month === today.getMonth() &&
                currentMonth.year === today.getFullYear();
            const hasEvent = hasEvents(day);
            days.push(
                <div
                    key={day}
                    className={`day ${isToday ? "today" : ""} ${hasEvent ? "has-events" : ""}`}
                    onClick={() => {
                        setActiveDate(new Date(currentMonth.year, currentMonth.month, day));
                        setActiveDay(day);
                        setCurrentDate(new Date(currentMonth.year, currentMonth.month, day));
                    }}
                >
                    {day}
                </div>
            );
        }

        // Add days from the next month to fill the last row
        const remainingCells = 7 - (days.length % 7);
        if (remainingCells !== 7) {
            for (let i = 0; i < remainingCells; i++) {
                days.push(
                    <div
                        key={`next-${i}`}
                        className="day next-date"
                        onClick={() => {
                            setActiveDate(new Date(currentMonth.year, currentMonth.month + 1, nextMonthFirstDate + i));
                            setActiveDay(nextMonthFirstDate + i);
                            setCurrentDate(new Date(currentMonth.year, currentMonth.month + 1, nextMonthFirstDate + i));
                        }}
                    >
                        {nextMonthFirstDate + i}
                    </div>
                );
            }
        }

        return days;
    };

    const handleNextMonth = () => {
        const nextMonth = currentMonth.month + 1;
        if (nextMonth > 11) {
            setCurrentMonth({ month: 0, year: currentMonth.year + 1 });
        } else {
            setCurrentMonth({ month: nextMonth, year: currentMonth.year });
        }
    };

    const handlePrevMonth = () => {
        const prevMonth = currentMonth.month - 1;
        if (prevMonth < 0) {
            setCurrentMonth({ month: 11, year: currentMonth.year - 1 });
        } else {
            setCurrentMonth({ month: prevMonth, year: currentMonth.year });
        }
    };

    const handleToday = () => {
        setToday(new Date());
        setActiveDate(new Date());
        setCurrentMonth({ month: today.getMonth(), year: today.getFullYear() });
    };

    const handleGotoDate = (input) => {
        const [month, year] = input.split("/").map((num) => parseInt(num));
        if (isNaN(month) || isNaN(year) || month < 1 || month > 12 || year < 1000) {
            alert("Invalid date format. Use mm/yyyy.");
            return;
        }
        setCurrentMonth({ month: month - 1, year: year });
    };

    return (
        <div className="calendar">
            <div className="month">
                <FaAngleLeft className="prev" onClick={handlePrevMonth} />
                <div className="date">
                    <h1>
                        {getMonthName(currentMonth.month)} {currentMonth.year}
                    </h1>
                </div>
                <FaAngleRight className="next" onClick={handleNextMonth} />
            </div>
            <div className="weekdays">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day}>{day}</div>
                ))}
            </div>
            <div className="days">{renderDays()}</div>
            <div className="goto-today">
                <div className="goto">
                    <input
                        type="text"
                        placeholder="mm/yyyy"
                        className="date-input"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleGotoDate(e.target.value);
                        }}
                    />
                    <button
                        className="goto-btn"
                        onClick={() =>
                            handleGotoDate(document.querySelector(".date-input").value)
                        }
                    >
                        Go
                    </button>
                </div>
                <button className="today-btn" onClick={handleToday}>
                    Today
                </button>
            </div>
        </div>
    );
};

export default Calendar;

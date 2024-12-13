import React from "react";
import { FaTrash } from "react-icons/fa";

const EventList = ({ activeDay, currentDate, events, deleteEvent }) => {
  const dayEvents = events.filter((event) => {
    const eventDate = new Date(event.start.dateTime);
    return (
      eventDate.getDate() === activeDay &&
      eventDate.getMonth() === currentDate.getMonth() &&
      eventDate.getFullYear() === currentDate.getFullYear()
    );
  });

  return (
    <div className="events">
      {activeDay ? (
        <>
          <div className="today-date">
            <div className="event-day">
              {new Date(currentDate.setDate(activeDay)).toLocaleString("en", {
                weekday: "short",
              })}
            </div>
            <div className="event-date">
              {activeDay}th {currentDate.toLocaleString("en", { month: "long" })}{" "}
              {currentDate.getFullYear()}
            </div>
          </div>
          <div className="events">
            {dayEvents.length > 0 ? (
              dayEvents.map((event, index) => (
                <div key={index} className="event">
                  <div className="event-title">{event.summary}</div>
                  <div className="event-time">
                    {new Date(event.start.dateTime).toLocaleTimeString("en", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(event.end.dateTime).toLocaleTimeString("en", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="delete-icon"><FaTrash className="delete" onClick={e => {deleteEvent(event.id)}}/></div>
                </div>
              ))
            ) : (
              <div className="no-event">No events for this day</div>
            )}
          </div>
        </>
      ) : (
        <div className="no-event">Please select a day to view events</div>
      )}
    </div>
  );
};

export default EventList;

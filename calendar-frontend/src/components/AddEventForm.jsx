import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddEventForm = ({ addEvent, showForm, setShowForm }) => {
  const [eventName, setEventName] = useState("");
  const [eventTimeFrom, setEventTimeFrom] = useState("");
  const [eventTimeTo, setEventTimeTo] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (eventName.trim() === "") {
      toast.warning("Event Name cannot be empty.");
      return;
    }
    if(eventTimeFrom.trim() === "") {
      toast.warning("Event Time From cannot be empty.");
      return;
    }
    if(eventTimeTo.trim() === "") {
      toast.warning("Event Time To cannot be empty.");
      return;
    }
    const newEvent = {
      eventName,
      eventTimeFrom,
      eventTimeTo,
    };
    addEvent(newEvent);
    setEventName("");
    setEventTimeFrom("");
    setEventTimeTo("");
  };

  return (
    <div className={showForm ? "add-event-wrapper active" : "add-event-wrapper"}>
      <ToastContainer autoClose={3000} position="top-right"/>
      <div className="add-event-header">
        <div className="title">Add Event</div>
        <FaTimes className="close" onClick={e => setShowForm(false)}/>
        
      </div>
      <div className="add-event-body">
        <div className="add-event-input">
        <label htmlFor="event-name">Name :</label>
          <input
            type="text"
            placeholder="Event Name"
            className="event-name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>
        <div className="add-event-input">
        <label htmlFor="event-time-from">From :</label>
          <input
            type="time"
            placeholder="Event Time From"
            className="event-time-from"
            value={eventTimeFrom}
            onChange={(e) => setEventTimeFrom(e.target.value)}
          />
        </div>
        <div className="add-event-input">
          <label htmlFor="event-time-to">To :</label>
          <input
            type="time"
            placeholder="Event Time To"
            className="event-time-to"
            value={eventTimeTo}
            onChange={(e) => setEventTimeTo(e.target.value)}
          />
        </div>
      </div>
      <div className="add-event-footer">
        <button className="add-event-btn" onClick={handleSubmit}>
          Add Event
        </button>
      </div>
    </div>
  );
};

export default AddEventForm;

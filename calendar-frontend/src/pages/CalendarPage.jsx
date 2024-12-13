import React, { useState, useEffect, useContext } from "react";
import Calendar from "../components/Calendar.jsx";
import AddEventForm from "../components/AddEventForm.jsx";
import EventList from "../components/Eventlist.jsx";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPlus } from "react-icons/fa";
import { UserContext } from "../App.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [activeDay, setActiveDay] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showForm, setShowForm] = useState(false);
    const { user, setUser } = useContext(UserContext);

    const navigate = useNavigate();


    const fetchUser = async () => {
      try {
        const userRes = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/user`, {
          withCredentials: true,
        });
  
        if (userRes.status === 200) {
          setUser(userRes.data.user);
  
          const eventsRes = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/events`, {
            withCredentials: true,
          });
  
          setEvents(eventsRes.data.events); 
        } else {
          toast.error("Please Login!!");
          navigate("/login");
        }
      } catch (err) {
        toast.error("Error fetching events.");
        navigate("/login");
      }
    };
    useEffect(() => {
      
        if (!user) {
          fetchUser();
        }
      }, [user, events]);
      

      const addEvent = async (newEvent) => {
        if (!activeDay) {
          toast.error("Please select a day to add an event.");
          return;
        }
      
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_BASE_API_URL}/events`,
            {
              ...newEvent 
            },
            { withCredentials: true }
          );
      
          if (response.status === 201) {
            toast.success("Event added successfully!");
            fetchUser();
            setShowForm(false);
          } else {
            toast.error(response.data.error);
          }
        } catch (error) {
          console.error("Error adding event:", error);
          toast.error("Failed to add event.");
        }
      };

      const deleteEvent = async (id) => {
        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_BASE_API_URL}/events/${id}`,                
                { withCredentials: true }
              );
          
              if (response.status === 200) {
                toast.success("Event added successfully!");
                fetchUser();
                toast.success("Event deleted successfully!");
                setShowForm(false);
              } else {
                toast.error(response.data.error);
              }
        } catch (error) {
            console.error("Error deleting event:", error);
          toast.error("Failed to delete event.");
        }
      }

      
      

    return (
        <div className="container">
            <div className="left">

                <div className="calendar">
                    <Calendar
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                        activeDay={activeDay}
                        setActiveDay={setActiveDay}
                        events={events}
                    />
                </div>
            </div>
            <div className="right">

                <EventList
                    activeDay={activeDay}
                    currentDate={currentDate}
                    events={events}
                    deleteEvent={deleteEvent}
                />

                <AddEventForm addEvent={addEvent} showForm={showForm} setShowForm={setShowForm} />
            </div>
            <button className="add-event" onClick={e => setShowForm(true)}>
                Create Event &nbsp;<FaPlus />
            </button>
            <ToastContainer autoClose={3000} position="top-right" />
        </div>
    );
}

export default CalendarPage
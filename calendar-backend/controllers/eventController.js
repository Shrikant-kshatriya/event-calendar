const { google } = require("googleapis");
const Event = require("../models/Event");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createGoogleCalendarEvent = async (req, res) => {
    const { eventName, eventTimeFrom, eventTimeTo, date } = req.body;
  
    if (!eventName || !eventTimeFrom || !eventTimeTo || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    try {
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
      }
  
      // Validate time format (HH:mm)
      if (!/^\d{2}:\d{2}$/.test(eventTimeFrom) || !/^\d{2}:\d{2}$/.test(eventTimeTo)) {
        return res.status(400).json({ error: "Invalid time format. Use HH:mm." });
      }
  
      const decodedToken = jwt.verify(
        req.cookies.token,
        process.env.JWT_SECRET_KEY
      );
      const user = await User.findOne({ googleId: decodedToken.googleId });
  
      if (!user || !user.accessToken) {
        return res.status(401).json({ error: "Unauthorized. Invalid or expired token." });
      }
  
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: user.accessToken });
  
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  
      const startDateTime = new Date(`${date}T${eventTimeFrom}:00`);
      const endDateTime = new Date(`${date}T${eventTimeTo}:00`);
  
      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        return res.status(400).json({ error: "Invalid date or time values provided." });
      }
  
      const eventResponse = await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: eventName,
          start: { dateTime: startDateTime.toISOString() },
          end: { dateTime: endDateTime.toISOString() },
        },
      });
  
      const googleEvent = eventResponse.data;
  
      const event = new Event({
        userId: user._id,
        googleEventId: googleEvent.id,
        name: googleEvent.summary,
        startDate: googleEvent.start.dateTime,
        endDate: googleEvent.end.dateTime,
      });
  
      await event.save();
  
      res.status(201).json({ message: "Event created successfully", event });
    } catch (err) {
      console.error("Error creating event:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  

const getGoogleCalendarEvents = async (req, res) => {
  try {
    const decodedToken = jwt.verify(
      req.cookies.token,
      process.env.JWT_SECRET_KEY
    );
    const user = await User.findOne({ googleId: decodedToken.googleId });

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: user.accessToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const eventsResponse = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = eventsResponse.data.items || [];

    res.status(200).json({ events });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteGoogleCalendarEvent = async (req, res) => {
  const { eventId } = req.params;
  const decodedToken = jwt.verify(
    req.cookies.token,
    process.env.JWT_SECRET_KEY
  );
  const user = await User.findOne({ googleId: decodedToken.googleId });

  try {
    const event = await Event.findOne({ googleEventId: eventId});

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: user.accessToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });

    if (event) {
        
        await Event.deleteOne({ googleEventId: eventId });
      }


    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createGoogleCalendarEvent,
  getGoogleCalendarEvents,
  deleteGoogleCalendarEvent,
};

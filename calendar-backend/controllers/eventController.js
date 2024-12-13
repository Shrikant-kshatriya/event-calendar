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

const setupGoogleWatch = async (req, res) => {
  try {
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

    const watchResponse = await calendar.events.watch({
      calendarId: "primary",
      requestBody: {
        id: `watch-${user.googleId}-${Date.now()}`,
        type: "web_hook",
        address: `${process.env.WEBHOOK_URL}/events/notifications`, 
      },
    });

    user.watchData = watchResponse.data;
    await user.save();

    res.status(200).json({ message: "Google Watch setup successfully", watchData: watchResponse.data });
  } catch (err) {
    console.error("Error setting up Google Watch:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const stopGoogleWatch = async (req, res) => {
  try {
    const decodedToken = jwt.verify(
      req.cookies.token,
      process.env.JWT_SECRET_KEY
    );
    const user = await User.findOne({ googleId: decodedToken.googleId });

    if (!user || !user.watchData) {
      return res.status(400).json({ error: "No active watch found for user." });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: user.accessToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    await calendar.channels.stop({
      requestBody: {
        id: user.watchData.id,
        resourceId: user.watchData.resourceId,
      },
    });

    user.watchData = null;
    await user.save();

    res.status(200).json({ message: "Google Watch stopped successfully" });
  } catch (err) {
    console.error("Error stopping Google Watch:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const handleGoogleNotifications = async (req, res) => {
  try {
    const channelId = req.headers["x-goog-channel-id"];
    const resourceId = req.headers["x-goog-resource-id"];

    const user = await User.findOne({ "watchData.id": channelId });

    if (!user) {
      console.error("User not found for channel ID:", channelId);
      return res.status(404).json({ error: "User not found for notification" });
    }

    if (user.watchData.resourceId !== resourceId) {
      console.error("Resource ID mismatch:", { channelId, resourceId });
      return res.status(400).json({ error: "Resource ID mismatch" });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: user.accessToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const eventsResponse = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(), 
      singleEvents: true,
      orderBy: "startTime",
    });

    const updatedEvents = eventsResponse.data.items || [];

    for (const event of updatedEvents) {
      const existingEvent = await Event.findOne({ googleEventId: event.id });

      if (existingEvent) {
        existingEvent.name = event.summary;
        existingEvent.startDate = event.start.dateTime || event.start.date;
        existingEvent.endDate = event.end.dateTime || event.end.date;
        await existingEvent.save();
      } else {
        const newEvent = new Event({
          userId: user._id,
          googleEventId: event.id,
          name: event.summary,
          startDate: event.start.dateTime || event.start.date,
          endDate: event.end.dateTime || event.end.date,
        });
        await newEvent.save();
      }
    }

    res.status(200).send("Notification handled successfully");
  } catch (err) {
    console.error("Error handling Google notification:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



module.exports = {
  createGoogleCalendarEvent,
  getGoogleCalendarEvents,
  deleteGoogleCalendarEvent,
  setupGoogleWatch,
  stopGoogleWatch,
  handleGoogleNotifications,
};

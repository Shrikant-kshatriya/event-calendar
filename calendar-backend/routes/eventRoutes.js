const express = require("express");
const {
  createGoogleCalendarEvent,
  getGoogleCalendarEvents,
  deleteGoogleCalendarEvent,
} = require("../controllers/eventController");
const router = express.Router();


router.post("/", createGoogleCalendarEvent);

router.get("/", getGoogleCalendarEvents);

router.delete("/:eventId", deleteGoogleCalendarEvent);

module.exports = router;

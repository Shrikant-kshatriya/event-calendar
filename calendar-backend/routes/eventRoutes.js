const express = require("express");
const {
  createGoogleCalendarEvent,
  getGoogleCalendarEvents,
  deleteGoogleCalendarEvent,
  setupGoogleWatch,
  stopGoogleWatch,
  handleGoogleNotifications,
} = require("../controllers/eventController");
const router = express.Router();


router.post("/", createGoogleCalendarEvent);

router.get("/", getGoogleCalendarEvents);

router.delete("/:eventId", deleteGoogleCalendarEvent);

router.post("/watch", setupGoogleWatch);
router.post("/notifications", handleGoogleNotifications); 
router.post("/stop-watch", stopGoogleWatch);

module.exports = router;

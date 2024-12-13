const express = require("express");
const User = require("../models/User");
const { createUser, getUser } = require("../controllers/userController");
const router = express.Router();

// Endpoint to store tokens
router.post("/", createUser);
router.get("/", getUser);

module.exports = router;


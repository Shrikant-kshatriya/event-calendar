const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createUser = async (req, res) => {
  const { accessToken } = req.body;

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const peopleService = google.people({ version: "v1", auth: oauth2Client });
    const userInfoResponse = await peopleService.people.get({
      resourceName: "people/me",
      personFields: "emailAddresses,names",
    });

    const userInfo = userInfoResponse.data;
    const email = userInfo.emailAddresses?.[0]?.value || "";
    const name = userInfo.names?.[0]?.displayName || "";
    const googleId = userInfo.names?.[0]?.metadata?.source?.id || "";

    if (!googleId || !email) {
      return res
        .status(400)
        .json({ error: "Unable to retrieve user information" });
    }

    let user = await User.findOne({ googleId });

    if (!user) {

      user = new User({
        googleId,
        email,
        name,
        accessToken,
      });
    } else {
      user.accessToken = accessToken;
    }

    await user.save();

    const jwtToken = jwt.sign({ googleId }, process.env.JWT_SECRET_KEY, {
      expiresIn: "365d",
    });

    res
      .cookie("token", jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", 
        sameSite: "None", 
        maxAge: 365 * 24 * 60 * 60 * 1000, 
      })
      .status(200)
      .json({ message: "User logged in successfully", user });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUser = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findOne({ googleId: decodedToken.googleId });
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Error retrieving user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { createUser, getUser };

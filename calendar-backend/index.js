require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db.js');
const userRoutes = require('./routes/userRoutes.js');
const eventRoutes = require('./routes/eventRoutes.js');
const cookieParser = require('cookie-parser');

const app = express();

// Connect to DB
db();

app.use(cors({
    origin: ['http://localhost:5173', 'https://event-calendar-frontend-three.vercel.app'], 
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
}));

// Cookie and body parsers
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/user', userRoutes);
app.use('/events', eventRoutes);

app.get('/', (req, res) => {
    res.send('Hello, World!');
})

// Start server
app.listen(4000, () => {
    console.log('Server is running on port', 4000);
});

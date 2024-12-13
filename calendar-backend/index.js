require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db.js');
const userRoutes = require('./routes/userRoutes.js');
const eventRoutes = require('./routes/eventRoutes.js');
const cookieParser = require('cookie-parser');

const app = express();

// connect to db
db();

// Middleware for CORS
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']   
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/user', userRoutes);
app.use('/events', eventRoutes);

app.listen(4000, () => {
    console.log('Server is running on port', 4000);
})
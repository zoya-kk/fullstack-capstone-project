/*jshint esversion: 8 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoLogger = require('./logger');
const authRoutes = require('./routes/authRoutes');

const connectToDatabase = require('./models/db');
const {loadData} = require("./util/import-mongo/index");

const app = express();
app.use("*", cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
const port = 3060;

// Connect to MongoDB; we just do this one time
connectToDatabase().then(() => {
    pinoLogger.info('Connected to DB');
})
    .catch((e) => console.error('Failed to connect to DB', e));



// Route files
const giftRoutes = require('./routes/giftRoutes');
const searchRoutes = require('./routes/searchRoutes');

const pinoHttp = require('pino-http');
const logger = require('./logger');

app.use(pinoHttp({ logger }));

// Use Routes
app.use('/api/gifts', giftRoutes);
app.use('/api/search', searchRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
});

app.get("/", (req, res) => {
    res.send("Inside the server");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
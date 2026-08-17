const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino');

const logger = pino();

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    try {
        // Task 1: Connect to giftsdb
        const db = await connectToDatabase();

        // Task 2: Access users collection
        const collection = db.collection("users");

        // Task 3: Check for existing email
        const existingEmail = await collection.findOne({
            email: req.body.email
        });

        if (existingEmail) {
            return res.status(400).json({
                error: 'Email already registered'
            });
        }

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
        const email = req.body.email;

        // Task 4: Save user details
        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });

        // Task 5: Create JWT authentication
        const payload = {
            user: {
                id: newUser.insertedId,
            },
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User registered successfully');
        res.json({ authtoken, email });

    } catch (e) {
        logger.error(e);
        return res.status(500).send('Internal server error');
    }
});

module.exports = router;
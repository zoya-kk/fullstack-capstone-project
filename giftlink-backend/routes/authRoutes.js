const express = require('express');
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


// ==============================
// REGISTER
// ==============================
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
            createdAt: new Date()
        });

        // Task 5: Create JWT authentication
        const payload = {
            user: {
                id: newUser.insertedId
            }
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User registered successfully');

        res.json({
            authtoken,
            email
        });

    } catch (e) {
        logger.error(e);
        return res.status(500).send('Internal server error');
    }
});


// ==============================
// UPDATE PROFILE
// ==============================
router.put('/update', async (req, res) => {
    try {
        // Task 2: Validate input
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            logger.error(
                'Validation errors in update request',
                errors.array()
            );

            return res.status(400).json({
                errors: errors.array()
            });
        }

        // Task 3: Check email in request header
        const email = req.headers.email;

        if (!email) {
            logger.error('Email not found in the request headers');

            return res.status(400).json({
                error: 'Email not found in the request headers'
            });
        }

        // Task 4: Connect to MongoDB
        const db = await connectToDatabase();

        // Access users collection
        const collection = db.collection("users");

        // Task 5: Find user credentials
        const existingUser = await collection.findOne({
            email: email
        });

        if (!existingUser) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Update user details
        if (req.body.firstName !== undefined) {
            existingUser.firstName = req.body.firstName;
        }

        if (req.body.lastName !== undefined) {
            existingUser.lastName = req.body.lastName;
        }

        existingUser.updatedAt = new Date();

        // Task 6: Update user credentials in database
        const updatedUser = await collection.findOneAndUpdate(
            { email: email },
            { $set: existingUser },
            { returnDocument: 'after' }
        );

        // Task 7: Create JWT authentication
        const payload = {
            user: {
                id: updatedUser._id.toString()
            }
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User updated successfully');

        res.json({
            authtoken
        });

    } catch (e) {
        logger.error(e);
        return res.status(500).send('Internal server error');
    }
});


module.exports = router;
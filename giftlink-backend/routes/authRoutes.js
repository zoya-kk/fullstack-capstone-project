const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino');

// Task 1: Use body and validationResult from express-validator
const { body, validationResult } = require('express-validator');

const logger = pino();

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;


// ==========================================
// REGISTER
// ==========================================
router.post('/register', async (req, res) => {
    try {
        // Connect to MongoDB
        const db = await connectToDatabase();

        // Access users collection
        const collection = db.collection("users");

        // Check for existing email
        const existingEmail = await collection.findOne({
            email: req.body.email
        });

        if (existingEmail) {
            logger.error('Email id already exists');

            return res.status(400).json({
                error: 'Email id already exists'
            });
        }

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
        const email = req.body.email;

        console.log('email is', email);

        // Save user
        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date()
        });

        // Create JWT
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


// ==========================================
// LOGIN
// ==========================================
router.post('/login', async (req, res) => {
    console.log("\n\n Inside login");

    try {
        const db = await connectToDatabase();
        const collection = db.collection("users");

        const theUser = await collection.findOne({
            email: req.body.email
        });

        if (theUser) {
            const result = await bcryptjs.compare(
                req.body.password,
                theUser.password
            );

            if (!result) {
                logger.error('Passwords do not match');

                return res.status(404).json({
                    error: 'Wrong pasword'
                });
            }

            const payload = {
                user: {
                    id: theUser._id.toString()
                }
            };

            const userName = theUser.firstName;
            const userEmail = theUser.email;

            const authtoken = jwt.sign(payload, JWT_SECRET);

            logger.info('User logged in successfully');

            return res.status(200).json({
                authtoken,
                userName,
                userEmail
            });

        } else {
            logger.error('User not found');

            return res.status(404).json({
                error: 'User not found'
            });
        }

    } catch (e) {
        logger.error(e);

        return res.status(500).json({
            error: 'Internal server error',
            details: e.message
        });
    }
});


// ==========================================
// UPDATE
// ==========================================
router.put('/update', async (req, res) => {

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

    try {
        // Task 3: Check email in header
        const email = req.headers.email;

        if (!email) {
            logger.error(
                'Email not found in the request headers'
            );

            return res.status(400).json({
                error: 'Email not found in the request headers'
            });
        }

        // Task 4: Connect to MongoDB
        const db = await connectToDatabase();
        const collection = db.collection("users");

        // Task 5: Find user
        const existingUser = await collection.findOne({
            email
        });

        if (!existingUser) {
            logger.error('User not found');

            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Update user name
        existingUser.firstName = req.body.name;
        existingUser.updatedAt = new Date();

        // Task 6: Update user in database
        const updatedUser = await collection.findOneAndUpdate(
            { email },
            { $set: existingUser },
            { returnDocument: 'after' }
        );

        // Task 7: Create JWT
        const payload = {
            user: {
                id: updatedUser._id.toString()
            }
        };

        const authtoken = jwt.sign(
            payload,
            JWT_SECRET
        );

        logger.info('User updated successfully');

        res.json({
            authtoken
        });

    } catch (error) {
        logger.error(error);

        return res.status(500).send(
            'Internal Server Error'
        );
    }
});


module.exports = router;
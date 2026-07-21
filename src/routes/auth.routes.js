const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /api/auth/signin - Authenticate user
router.post('/signin', authController.signIn);

// POST /api/auth/send-email - Send password recovery email
router.post('/send-email', authController.sendEmail);

// POST /api/auth/send-sms - Send OTP via SMS
router.post('/send-sms', authController.sendSms);

module.exports = router;
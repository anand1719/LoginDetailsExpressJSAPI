const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// POST /api/chat - Send message to AI (requires authentication)
router.post('/', verifyToken, chatController.chat);

module.exports = router;
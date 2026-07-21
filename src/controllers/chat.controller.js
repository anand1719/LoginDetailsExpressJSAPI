const chatService = require('../services/chat.service');

/**
 * POST /api/chat
 * Send a message to AI chat
 */
async function chat(req, res) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const reply = await chatService.chatWithGroq(message);
    res.json({ reply });
  } catch (error) {
    console.error('Error communicating with Groq:', error);
    res.status(500).json({ error: 'Error communicating with AI service' });
  }
}

module.exports = {
  chat
};
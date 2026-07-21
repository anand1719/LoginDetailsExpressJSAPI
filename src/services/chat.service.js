const Groq = require('groq-sdk');
const OpenAI = require('openai');
const axios = require('axios');
const config = require('../config/env');

let groqClient = null;
let openaiClient = null;

if (config.GROQ_API_KEY) {
  groqClient = new Groq({ apiKey: config.GROQ_API_KEY });
}

if (config.OPENAI_API_KEY) {
  openaiClient = new OpenAI({ apiKey: config.OPENAI_API_KEY });
}

/**
 * Chat with Groq AI model with web search augmentation via Tavily
 * @param {string} message - User message
 * @returns {Promise<string>} - AI response
 */
async function chatWithGroq(message) {
  if (!groqClient) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  // Search the web using Tavily
  const searchResponse = await axios.post(
    'https://api.tavily.com/search',
    {
      api_key: config.TAVILY_API_KEY,
      query: message,
      search_depth: 'basic',
      include_answer: true,
      max_results: 5
    }
  );

  const searchResults = searchResponse.data.results
    .map((item, index) =>
      `${index + 1}. ${item.title}
${item.content}
Source: ${item.url}`
    )
    .join('\n\n');

  const response = await groqClient.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant. Use the following search results to answer the user's question:

${searchResults}

If multiple sources exist, summarize them in bullet points. Mention source URLs when appropriate.`
      },
      { role: 'user', content: message }
    ],
  });

  return response.choices[0].message.content;
}

module.exports = {
  chatWithGroq
};
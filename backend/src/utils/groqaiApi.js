const Groq = require('groq-sdk');
const User = require('../models/User');
/**
 * Get an GroqAI client - uses user's key if available, falls back to system key
 */
const exportData = {}
exportData.getGroqAIClient = async (userId) => {
    const user = await User.findById(userId);
    const userKey = user?.getApiKey('groq');
    const apiKey = userKey || "" //process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error('No Groq API key configured. Please add your API key in settings.');
    }

    return new Groq({ apiKey });
};

module.exports = exportData;
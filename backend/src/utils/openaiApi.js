const OpenAI = require('openai');
const User = require('../models/User');
/**
 * Get an OpenAI client - uses user's key if available, falls back to system key
 */
const exportData = {}
exportData.getOpenAIClient = async (userId) => {
    const user = await User.findById(userId);
    const userKey = user?.getApiKey('openai');
    const apiKey = userKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error('No OpenAI API key configured. Please add your API key in settings.');
    }

    return new OpenAI({ apiKey });
};
module.exports = exportData;
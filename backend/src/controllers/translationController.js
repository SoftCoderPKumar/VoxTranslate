const { validationResult } = require('express-validator');
const OpenAI = require('openai');
const Groq = require('groq-sdk');
const Translation = require('../models/Translation')
const User = require('../models/User');
const logger = require('../utils/logger')
const { SUPPORTED_LANGUAGES } = require('../utils/content')

/**
 * Get an OpenAI client - uses user's key if available, falls back to system key
 */
const getOpenAIClient = async (userId) => {
    const user = await User.findById(userId);
    const userKey = user?.getApiKey('openai');
    const apiKey = userKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error('No OpenAI API key configured. Please add your API key in settings.');
    }

    return new OpenAI({ apiKey });
};

/**
 * Get an GroqAI client - uses user's key if available, falls back to system key
 */
const getGroqAIClient = async (userId) => {
    const user = await User.findById(userId);
    const userKey = user?.getApiKey('groq');
    const apiKey = userKey || process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error('No Groq API key configured. Please add your API key in settings.');
    }

    return new Groq({ apiKey });
};

/**
 * POST /api/translate/text
 * Translate text using OpenAI
 */
const translateText = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', errors: errors.array() });
        }
        let client
        const { text, provider, targetLanguage, sourceLanguage = 'auto' } = req.body;
        const userId = req.user._id;

        if (!SUPPORTED_LANGUAGES[targetLanguage]) {
            return res.status(400).json({ error: 'Unsupported target language' });
        }
        if (provider === 'groq')
            client = await getGroqAIClient(userId);
        else if (provider === 'openai')
            client = await getOpenAIClient(userId);
        else
            return res.status(400).json({ error: 'Unsupported provider' });

        const targetLangName = SUPPORTED_LANGUAGES[targetLanguage];
        const sourceLangName = sourceLanguage === 'auto' ? 'auto-detected' : (SUPPORTED_LANGUAGES[sourceLanguage] || sourceLanguage);

        const systemPrompt = `You are a professional translator. Translate the given text to ${targetLangName}.
Rules:
- Translate ONLY the text, preserve formatting, punctuation and structure
- If source language is auto-detected, detect it automatically
- Return a JSON object with: { "translatedText": "...", "detectedLanguage": "language_code", "confidence": 0.0-1.0 }
- The detectedLanguage should be an ISO 639-1 language code (e.g., "en", "fr", "es")
- Respond ONLY with the JSON object, no additional text`;
        const model = provider === 'openai' ? 'gpt-4o-mini' : 'llama-3.3-70b-versatile'

        //groq model
        // "llama-3.1-70b-versatile" - balanced performance
        // "mixtral-8x7b-32768" - good for long resumes
        // "gemma2-9b-it" - lightweight option

        const response = await client.chat.completions.create({
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text },
            ],
            temperature: 0.1,
            max_tokens: 2000,
            response_format: { type: 'json_object' },
        });

        const result = JSON.parse(response.choices[0].message.content);

        // Save to history
        const translation = new Translation({
            userId,
            originalText: text,
            translatedText: result.translatedText,
            sourceLanguage,
            detectedLanguage: result.detectedLanguage,
            targetLanguage,
            provider: provider,
            inputType: 'text',
            confidence: result.confidence,
        });
        await translation.save();

        // Increment counter
        await User.findByIdAndUpdate(userId, { $inc: { translationCount: 1 } });

        res.status(200).json({
            translatedText: result.translatedText,
            detectedLanguage: result.detectedLanguage,
            detectedLanguageName: SUPPORTED_LANGUAGES[result.detectedLanguage] || result.detectedLanguage,
            confidence: result.confidence,
            translationId: translation._id,
        });
    } catch (error) {
        logger.error('Translation error:', error);
        if (error.message.includes('No OpenAI API key')) {
            return res.status(400).json({ error: error.message });
        }
        if (error.status === 401) {
            return res.status(401).json({ error: 'Invalid OpenAI API key' });
        }
        if (error.status === 429) {
            return res.status(429).json({ error: 'OpenAI rate limit exceeded. Please try again later.' });
        }
        next(error);
    }
};

/**
 * POST /api/translate/audio
 * Transcribe audio then translate using OpenAI Whisper + GPT
 */
const translateAudio = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', errors: errors.array() });
        }
        let client
        const { provider, targetLanguage, sourceLanguage = 'auto' } = req.body;
        const audioFile = req.file;
        const userId = req.user._id;

        if (!audioFile) {
            return res.status(400).json({ error: 'Audio file is required' });
        }

        if (provider === 'groq')
            client = await getGroqAIClient(userId);
        else if (provider === 'openai')
            client = await getOpenAIClient(userId);
        else
            return res.status(400).json({ error: 'Unsupported provider' });

        // Step 1: Transcribe with Whisper
        let audioStream
        if (provider === 'groq')
            audioStream = await Groq.toFile(audioFile.buffer, 'audio.wav', { type: audioFile.mimetype });
        else {
            const { Readable } = require('stream');
            audioStream = Readable.from(audioFile.buffer);
            audioStream.path = `audio.${audioFile.mimetype.split('/')[1] || 'webm'}`;
        }
        const model = provider === 'openai' ? 'whisper-1' : 'whisper-large-v3';
        // Groq model
        // whisper-large-v3,
        // whisper-large-v3-turbo
        // Inside your controller

        const transcriptionParams = {
            file: audioStream,
            model: model,
            prompt: "Specify context or spelling",
            temperature: 0,
            response_format: "verbose_json"
        };

        if (sourceLanguage !== 'auto') {
            transcriptionParams.language = sourceLanguage;
        }

        const transcription = await client.audio.transcriptions.create(transcriptionParams);
        const originalText = transcription.text;
        if (!originalText?.trim()) {
            return res.status(400).json({ error: 'No speech detected in audio' });
        }

        // Step 2: Translate
        const targetLangName = SUPPORTED_LANGUAGES[targetLanguage];
        const textModel = provider === 'openai' ? 'gpt-4o-mini' : 'llama-3.3-70b-versatile'

        //groq model
        // "llama-3.1-70b-versatile" - balanced performance
        // "mixtral-8x7b-32768" - good for long resumes
        // "gemma2-9b-it" - lightweight option

        const translationResponse = await client.chat.completions.create({
            model: textModel,
            messages: [
                {
                    role: 'system',
                    content: `Translate to ${targetLangName}. Return JSON: { "translatedText": "...", "detectedLanguage": "code" }`,
                },
                { role: 'user', content: originalText },
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' },
        });

        const result = JSON.parse(translationResponse.choices[0].message.content);
        // Save
        const translation = new Translation({
            userId,
            originalText,
            translatedText: result.translatedText,
            sourceLanguage,
            detectedLanguage: result.detectedLanguage,
            targetLanguage,
            provider: provider,
            inputType: 'audio',
            duration: audioFile.size / 16000,
            metadata: { audioSize: audioFile.size, mimeType: audioFile.mimetype },
        });
        await translation.save();
        await User.findByIdAndUpdate(userId, { $inc: { translationCount: 1 } });

        res.status(200).json({
            originalText,
            translatedText: result.translatedText,
            detectedLanguage: result.detectedLanguage,
            detectedLanguageName: SUPPORTED_LANGUAGES[result.detectedLanguage] || result.detectedLanguage,
            translationId: translation._id,
        });
    } catch (error) {
        if (error.status === 429) {
            return res.status(429).json({ error: 'OpenAI rate limit exceeded. Please try again later.' });
        }
        if (error.status === 4134) {
            return res.status(413).json({ error: 'GroqAI Request Entity Too Large.' });
        }
        logger.error('Audio translation error:', error);
        next(error);
    }
};

/**
 * GET /api/translate/history
 */
const getHistory = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, targetLanguage } = req.query;
        const query = { userId: req.user._id };
        if (targetLanguage) query.targetLanguage = targetLanguage;

        const translations = await Translation.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const total = await Translation.countDocuments(query);

        res.status(200).json({
            translations,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/translate/languages
 */
const getLanguages = (req, res) => {
    const languages = Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({ code, name }));
    res.status(200).json({ languages });
};

/**
 * DELETE /api/translate/history/:id
 */
const deleteTranslation = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const translation = await Translation.findOneAndDelete({
            _id: req.params.id,
            userId: userId,
        });
        if (!translation) {
            return res.status(404).json({ error: 'Translation not found' });
        }
        await User.findByIdAndUpdate(userId, { $inc: { translationCount: -1 } });
        res.status(200).json({ message: 'Translation deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    translateText,
    translateAudio,
    getHistory,
    getLanguages,
    deleteTranslation,
};
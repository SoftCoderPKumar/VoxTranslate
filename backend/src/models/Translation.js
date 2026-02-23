const mongoose = require('mongoose');
const { PROVIDER_TYPES, TRANSLATION_INPUT_TYPES } = require('../utils/content')

const translationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    originalText: {
        type: String,
        required: true,
        maxlength: 5000,
    },
    translatedText: {
        type: String,
        required: true,
        maxlength: 5000,
    },
    sourceLanguage: {
        type: String,
        required: true,
        default: 'auto',
    },
    detectedLanguage: {
        type: String,
        default: null,
    },
    targetLanguage: {
        type: String,
        required: true,
    },
    duration: {
        type: Number, // in seconds
        default: null,
    },
    inputType: {
        type: String,
        enum: TRANSLATION_INPUT_TYPES,
        default: 'text',
    },
    provider: {
        type: String,
        enum: PROVIDER_TYPES,
        default: 'openai',
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: null,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});

translationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Translation', translationSchema);

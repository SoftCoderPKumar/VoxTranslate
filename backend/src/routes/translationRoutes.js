const express = require('express')
const { body } = require('express-validator');
const multer = require('multer');
const {
    translateText,
    translateAudio,
    getHistory,
    getLanguages,
    deleteTranslation
} = require('../controllers/translationController');
const { authenticate } = require('../middleware/auth');
const { PROVIDER_TYPES } = require('../utils/content')

const router = express.Router()

// Multer config for audio uploads (in-memory, max 50MB)
const audioStorage = multer.memoryStorage();

const audioUpload = multer({
    storage: audioStorage,
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/x-m4a'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'), false);
        }
    },
});

// Text translation validation
const textTranslationValidation = [
    body('text')
        .trim()
        .notEmpty().withMessage('Text is required')
        .isLength({ max: 10000 }).withMessage('Text cannot exceed 10000 characters'),
    body('targetLanguage')
        .trim()
        .notEmpty().withMessage('Target language is required'),
    body('provider')
        .trim()
        .notEmpty().withMessage('Provider is required')
        .isIn(PROVIDER_TYPES)
        .withMessage(`Provider must be one of: ${PROVIDER_TYPES.join(', ')}`)
        .isString(),
];

// Audio translation validation
const audioTranslationValidation = [
    body('targetLanguage')
        .trim()
        .notEmpty().withMessage('Target language is required'),
    body('provider')
        .trim()
        .notEmpty().withMessage('Provider is required')
        .isIn(PROVIDER_TYPES)
        .withMessage(`Provider must be one of: ${PROVIDER_TYPES.join(', ')}`)
        .isString(),
];

// All routes require authentication
router.use(authenticate);


router.get('/languages', getLanguages);
router.post('/text', textTranslationValidation, translateText);
router.post('/audio', audioUpload.single('audio'), audioTranslationValidation, translateAudio);
router.get('/history', getHistory);
router.delete('/history/:id', deleteTranslation);

module.exports = router;
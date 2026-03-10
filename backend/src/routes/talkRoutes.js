const express = require('express');
const { talkAboutAnything } = require('../controllers/talkController');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');
const { PROVIDER_TYPES, DIFFICULTY_LEVEL } = require('../utils/content');


const router = express.Router();
router.use(authenticate);

const chatbotValidation = [
    body('topic').optional().trim().isString().default(""),
    body('topic').default(""),
    body('question').optional().trim().isString().default(""),
    body('question').default(""),
    body('studentAnswer').optional().trim().isString().default(""),
    body('studentAnswer').default(""),
    body('provider')
        .trim()
        .notEmpty().withMessage('Provider is required')
        .isIn(PROVIDER_TYPES)
        .withMessage(`Provider must be one of: ${PROVIDER_TYPES.join(', ')}`)
        .isString(),
    body('difficultyLevel')
        .trim()
        .optional()
        .isIn(DIFFICULTY_LEVEL)
        .withMessage(`difficulty level must be one of: ${DIFFICULTY_LEVEL.join(', ')}`)
        .isString(),
    body('difficultyLevel').default(DIFFICULTY_LEVEL[0]),

];


router.post('/general', chatbotValidation, talkAboutAnything);

module.exports = router;
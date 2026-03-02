const express = require('express');
const { chatbotPost, embeddingVectorPost } = require('../controllers/genaiController');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');


const router = express.Router();
router.use(authenticate);

const chatbotValidation = [
    body('query').trim().notEmpty().withMessage('query is required').isLength({ min: 5 }).withMessage('Query must be at least 5 characters')
];

const embeddingValidation = [
    body('from').trim().notEmpty().withMessage('from is required').isNumeric().withMessage('from must be a number').isInt().withMessage('from must be an integer').custom((value, { req }) => {
        if (parseInt(value) >= parseInt(req.body.to)) {
            throw new Error('from must be less than to');
        }
        return true;
    }),
    body('to').trim().notEmpty().withMessage('to is required').isNumeric().withMessage('from must be a number').isInt().withMessage('from must be an integer').custom((value, { req }) => {
        if (parseInt(value) <= parseInt(req.body.from)) {
            throw new Error('to must be greater than from');
        }
        return true;
    }),

];

router.post('/chatbot', chatbotValidation, chatbotPost);
router.post('/embedding-vector', embeddingValidation, embeddingVectorPost);

module.exports = router;
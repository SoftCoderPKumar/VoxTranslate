const express = require('express');
const { body } = require('express-validator');
const {
    getProfile,
    updateProfile,
    saveApiKey,
    deleteApiKey,
    changePassword,
    deleteAccount
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { PROVIDER_TYPES } = require('../utils/content')

const router = express.Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', [
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('preferredTargetLanguage').optional().isString(),
], updateProfile);

router.put('/api-key', [
    body('apiKey')
        .trim()
        .notEmpty().withMessage('API key is required')
        .isLength({ min: 10 }).withMessage('Valid API key is required')
        .isString(),
    body('provider')
        .trim()
        .notEmpty().withMessage('Provider is required')
        .isIn(PROVIDER_TYPES)
        .withMessage(`Provider must be one of: ${PROVIDER_TYPES.join(', ')}`)
        .isString(),
], saveApiKey);
router.delete('/api-key', [
    body('provider')
        .trim()
        .notEmpty().withMessage('Provider is required')
        .isIn(PROVIDER_TYPES)
        .withMessage(`Provider must be one of: ${PROVIDER_TYPES.join(', ')}`)
        .isString(),
], deleteApiKey);

router.put('/password', [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword')
        .isLength({ min: 8 }).withMessage('Must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
], changePassword);

router.delete('/account', [
    body('password').notEmpty().withMessage('Password is required')
], deleteAccount);

module.exports = router
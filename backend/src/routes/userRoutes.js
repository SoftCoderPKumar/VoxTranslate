const express = require('express');
const { body, param } = require('express-validator');
const {
    getProfile,
    updateProfile,
    saveApiKey,
    deleteApiKey,
    changePassword,
    deleteAccount,
    getUsers,
    deleteUser,
    updateUser,
    addUser
} = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { PROVIDER_TYPES } = require('../utils/content')

const router = express.Router();

router.use(authenticate);

const updateProfileValidation = [
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('preferredTargetLanguage').optional().isString(),
];

const updateApiKeyValidation = [
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
];

const deleteApiKeyValidation = [
    body('provider')
        .trim()
        .notEmpty().withMessage('Provider is required')
        .isIn(PROVIDER_TYPES)
        .withMessage(`Provider must be one of: ${PROVIDER_TYPES.join(', ')}`)
        .isString(),
];
const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword')
        .isLength({ min: 8 }).withMessage('Must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
];
const deleteAccountValidation = [
    body('password').notEmpty().withMessage('Password is required')
];
const deleteUserValidation = [
    param('userId').notEmpty().withMessage('userId is required')
];

const updateUserValidation = [
    body('userId').notEmpty().withMessage('userId is required'),
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin'),
];

const addUserValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean').default(true),
    body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin').default('user'),
];

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, updateProfile);
router.get('/list', requireAdmin, getUsers)
router.put('/api-key', updateApiKeyValidation, saveApiKey);
router.delete('/api-key', deleteApiKeyValidation, deleteApiKey);
router.put('/password', changePasswordValidation, changePassword);
router.delete('/account', deleteAccountValidation, deleteAccount);
router.delete('/delete/:userId', requireAdmin, deleteUserValidation, deleteUser);
router.patch('/update', requireAdmin, updateUserValidation, updateUser);
router.post('/add', requireAdmin, addUserValidation, addUser);


module.exports = router
const { validationResult } = require('express-validator');
const OpenAI = require('openai');
const Groq = require('groq-sdk');
const User = require('../models/User');
const { revokeAllUserTokens, clearTokenCookies } = require('../utils/tokenUtils');
const logger = require('../utils/logger');
const { PROVIDER_TYPES } = require('../utils/content')


/**
 * GET /api/user/profile
 */
const getProfile = async (req, res) => {
    res.status(200).json({ user: req.user.toSafeObject() });
};

/**
 * PUT /api/user/profile
 */
const updateProfile = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', errors: errors.array() });
        }

        const { name, preferredSourceLanguage, preferredTargetLanguage } = req.body;
        const updates = {};
        if (name) updates.name = name;
        if (preferredSourceLanguage) updates.preferredSourceLanguage = preferredSourceLanguage;
        if (preferredTargetLanguage) updates.preferredTargetLanguage = preferredTargetLanguage;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: 'Profile updated', user: user.toSafeObject() });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/user/api-key
 * Save encrypted API key
 */
const saveApiKey = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', errors: errors.array() });
        }
        const { apiKey, provider } = req.body;

        // Validate OpenAI key by making a test request
        if (provider === 'openai') {
            try {
                const testClient = new OpenAI({ apiKey: apiKey.trim() });
                await testClient.models.list();
            } catch (err) {
                if (err.status === 401) {
                    return res.status(400).json({ error: 'Invalid OpenAI API key - authentication failed' });
                }
                // Other errors might be rate limits, proceed anyway
                logger.warn('API key validation warning:', err.message);
            }
        }

        // Validate GroqAI key by making a test request
        if (provider === 'groq') {
            try {
                const testClient = new Groq({
                    apiKey: apiKey.trim(),
                });
                let tt = await testClient.models.list();

            } catch (err) {
                if (err.status === 401) {
                    return res.status(400).json({ error: 'Invalid Groq API key - authentication failed' });
                }
                // Other errors might be rate limits, proceed anyway
                logger.warn('API key validation warning:', err.message);
            }
        }

        const user = await User.findById(req.user._id);
        user.setApiKey(apiKey.trim(), provider.trim().toLowerCase());
        await user.save({ validateBeforeSave: false });

        logger.info(`API key saved for user: ${req.user.email}`);
        res.status(200).json({ message: 'API key saved successfully', hasApiKey: true });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/user/api-key
 */
const deleteApiKey = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', errors: errors.array() });
        }
        const { provider } = req.body;
        const updateQuery = {}

        if (provider === 'openai') {
            updateQuery.openaiApiKey = null
        }
        if (provider === 'groq') {
            updateQuery.groqaiApiKey = null
        }

        await User.findByIdAndUpdate(req.user._id, { $set: updateQuery });
        res.status(200).json({ message: 'API key removed', hasApiKey: false });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/user/password
 */
const changePassword = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        // Revoke all refresh tokens (force re-login)
        await revokeAllUserTokens(user._id);
        clearTokenCookies(res);

        res.status(200).json({ message: 'Password changed. Please log in again.' });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/user/account
 */
const deleteAccount = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', errors: errors.array() });
        }
        const { password } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect password' });
        }

        await revokeAllUserTokens(user._id);
        clearTokenCookies(res);
        await User.findByIdAndUpdate(user._id, { isDeleted: true });

        res.status(200).json({ message: 'Account deactivated successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/user/delete
 * Admin-only endpoint to delete a user account by user ID. This will mark the user as deleted and revoke all their tokens.
 */
const deleteUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', errors: errors.array() });
        }
        const { userId } = req.params;
        const user = await User.findById(userId).select('role');


        if (!user.role || user.role !== 'user') {
            return res.status(400).json({ error: 'Can only delete regular user accounts' });
        }
        await revokeAllUserTokens(user._id);
        await User.findByIdAndUpdate(user._id, { isDeleted: true });

        res.status(200).json({ message: 'Account deactivated successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/user/profile
 */
const updateUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', errors: errors.array() });
        }

        const { userId, name, isActive, role } = req.body;
        const updates = {};
        if (name) updates.name = name;
        if (role) updates.role = role;
        if (typeof isActive !== 'undefined' && typeof isActive === 'boolean') updates.isActive = isActive;


        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (user.isActive === false) {
            await revokeAllUserTokens(user._id);
        }
        res.status(200).json({ message: 'Profile updated', user: user });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/user/add
 * Admin-only endpoint to add a new user account. The request body should include name, email, password, and optionally role and isActive.
 */
const addUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', errors: errors.array() });
        }

        const { name, email, role, isActive } = req.body;
        const password = "Password@123"; // Default temporary password, should be changed by user on first login
        // Check existing user
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ error: 'Email already Registered' })
        }

        //Create user
        const user = new User({ name, email, password, role: role || 'user', isActive: typeof isActive === 'boolean' ? isActive : true })
        await user.save();
        logger.info(`New user created:${email} with temporary password. ${password}`);
        res.status(201).json({
            message: 'Registration successful',
            user: user
        });
    } catch (error) {
        next(error)
    }
};


/**
 * GET /api/translate/history
 */
const getUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, q } = req.query;
        const query = { isDeleted: false };
        if (q) query.$and = [
            {
                $or: [
                    { name: { $regex: decodeURIComponent(q), $options: "i" } },
                    { email: { $regex: decodeURIComponent(q), $options: "i" } }
                ]
            }
        ];


        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const total = await User.countDocuments(query);

        res.status(200).json({
            users,
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


module.exports = {
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
};
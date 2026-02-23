const { validationResult } = require('express-validator');
const User = require('../models/User');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens,
    setTokenCookies,
    clearTokenCookies,
} = require('../utils/tokenUtils');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', errors: errors.array() });
        }

        const { name, email, password } = req.body;

        // Check existing user
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ error: 'Email already Registered' })
        }

        //Create user
        const user = new User({ name, email, password })
        await user.save();

        //Generate tokens
        const tokenPayload = { id: user._id, email: user.email, role: user.role };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = await generateRefreshToken(user._id);

        //Set cookies
        setTokenCookies(res, accessToken, refreshToken);

        //update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        logger.info(`New user registered:${email}`);

        res.status(201).json({
            message: 'Registration successful',
            user: user.toSafeObject(),
        });
    } catch (error) {
        next(error)
    }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', errors: errors.array() });
        }

        const { email, password } = req.body;

        //Find user with password
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Revoke old tokens for this user (optional: comment out for multi-device support)
        await revokeAllUserTokens(user._id);

        // Generate new tokens
        const tokenPayload = { id: user._id, email: user.email, role: user.role };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = await generateRefreshToken(user._id);

        setTokenCookies(res, accessToken, refreshToken);

        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        logger.info(`User logged in: ${email}`);

        res.status(200).json({
            message: 'Login successful',
            user: user.toSafeObject(),
        });
    } catch (error) {
        next(error)
    }
}

/**
 * POST /api/auth/refresh
 * Uses refresh token from cookie to issue new access token
 */
const refresh = async (req, res, next) => {
    try {
        const refreshTokenId = req.cookies?.refreshToken;
        if (!refreshTokenId) {
            return res.status(401).json({ error: 'Refresh token required', code: 'NO_REFRESH_TOKEN' });
        }

        const { valid, userId, tokenId, error } = await verifyRefreshToken(refreshTokenId);
        if (!valid) {
            clearTokenCookies(res);
            return res.status(401).json({ error: error || 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user || !user.isActive) {
            await revokeRefreshToken(tokenId);
            clearTokenCookies(res);
            return res.status(401).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
        }

        // Rotate: revoke old, issue new
        await revokeRefreshToken(tokenId);
        const newAccessToken = generateAccessToken({ id: user._id, email: user.email, role: user.role });
        const newRefreshToken = await generateRefreshToken(user._id);

        setTokenCookies(res, newAccessToken, newRefreshToken);

        res.status(200).json({
            message: 'Token refreshed',
            user: user.toSafeObject(),
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
    try {
        const refreshTokenId = req.cookies?.refreshToken;
        if (refreshTokenId) {
            await revokeRefreshToken(refreshTokenId);
        }
        clearTokenCookies(res);
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
    res.status(200).json({ user: req.user.toSafeObject() });
};

module.exports = { register, login, refresh, logout, getMe };
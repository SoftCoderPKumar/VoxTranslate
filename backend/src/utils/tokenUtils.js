const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getRedisClient } = require('../config/redis');
const { REFRESH_TOKEN_PREFIX, REFRESH_TOKEN_TTL } = require('../utils/content')
const logger = require('./logger');

/**
 * Generate a short-lived access token (JWT)
 */
const generateAccessToken = (payload) => {
    return jwt.sign(
        { ...payload, type: 'access' },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
    );
};

/**
 * Generate a long-lived refresh token (UUID stored in Redis)
 */
const generateRefreshToken = async (userId) => {
    const tokenId = uuidv4();
    const redis = getRedisClient();

    const tokenData = JSON.stringify({
        userId: userId.toString(),
        tokenId,
        createdAt: new Date().toISOString(),
    });

    await redis.set(
        `${REFRESH_TOKEN_PREFIX}${tokenId}`,
        tokenData,
        'EX',
        REFRESH_TOKEN_TTL
    );

    logger.info(`Refresh token stored in Redis for user: ${userId}`)
    return tokenId;
};

/**
 * Verify an access token
 */
const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        if (decoded.type !== 'access') throw new Error('Invalid token type');
        return { valid: true, decoded }
    } catch (error) {
        return { valid: false, error: error.message }
    }
}

/**
 * Verify a refresh token from Redis
 */
const verifyRefreshToken = async (tokenId) => {
    try {
        const redis = getRedisClient();
        const tokenData = await redis.get(`${REFRESH_TOKEN_PREFIX}${tokenId}`);

        if (!tokenData) {
            return { valid: false, error: 'Refresh token not found or expired' }
        }

        const parsed = JSON.parse(tokenData);
        return { valid: true, userId: parsed.userId, tokenId: parsed.tokenId }
    } catch (error) {
        logger.error('Error verifying refresh token:', error)
        return { valid: false, error: "Token verification failed" }
    }
}

/**
 * Revoke a specific refresh token
 */
const revokeRefreshToken = async (tokenId) => {
    try {
        const redis = getRedisClient();
        await redis.del(`${REFRESH_TOKEN_PREFIX}${tokenId}`);
        logger.info(`Refresh token revoked: ${tokenId}`)
        return true;
    } catch (error) {
        logger.error('Error revoking refresh token:', error)
    }
    return false
};

/**
 * Revoke all refresh tokens for a user
 */
const revokeAllUserTokens = async (userId) => {
    try {
        const redis = getRedisClient();
        const keys = await redis.keys(`${REFRESH_TOKEN_PREFIX}*`)

        const pipeline = redis.pipeline ? redis.pipeline() : null
        let count = 0;

        for (const key of keys) {
            const data = await redis.get(key);
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed.userId === userId.toString()) {
                    if (pipeline) {
                        pipeline.del(key);
                    } else {
                        await redis.del(key);
                    }
                    count++
                }
            }
        }

        if (pipeline) await pipeline.exec();
        logger.info(`Revoked ${count} tokens for user: ${userId}`)
        return count
    } catch (error) {
        logger.error('Error revoking user tokens', error)
        return 0;
    }
}

/**
 * Set secure HTTP-only cookies for both tokens
 */
const setTokenCookies = (res, accessToken, refreshToken) => {
    const isProduction = process.env.NODE_ENV === 'production'
    const isSecure = process.env.COOKIE_SECURE === 'true' || isProduction
    const sameSite = process.env.COOKIE_SAME_SITE || (isProduction ? 'strict' : 'lax');

    // Access token cookie (15 min)
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite,
        maxAge: 15 * 60 * 1000, //15 minutes
        path: '/'
    });

    // Refresh token cookie (7 days)
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api/auth', // Restrict refresh token to auth routes only
    });
};

/**
 * Clear auth cookies
 */
const clearTokenCookies = (res) => {
    res.clearCookie('accessToken', { path: "/" });
    res.clearCookie('refreshToken', { path: "/api/auth" });
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens,
    setTokenCookies,
    clearTokenCookies,
};
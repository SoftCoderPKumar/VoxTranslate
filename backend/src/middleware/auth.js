const { verifyAccessToken } = require('../utils/tokenUtils');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate requests using JWT from HttpOnly cookies
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from HttpOnly cookie (primary) or Authorization header (fallback)
        let token = req.cookies?.accessToken;

        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return res.status(401).json({
                error: 'Authentication required',
                code: 'NO_TOKEN',
            });
        }

        const { valid, decoded, error } = verifyAccessToken(token);

        if (!valid) {
            return res.status(401).json({
                error: 'Invalid or expired token',
                code: 'INVALID_TOKEN',
                details: error,
            });
        }

        // Fetch fresh user data
        const user = await User.findById(decoded.id).select('-password');
        if (!user || !user.isActive) {
            return res.status(401).json({
                error: 'User not found or deactivated',
                code: 'USER_NOT_FOUND',
            });
        }

        req.user = user;
        req.tokenDecoded = decoded;
        next();
    } catch (error) {
        logger.error('Authentication middleware error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

/**
 * Middleware to require admin role
 */
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({
            error: 'Admin privileges required',
            code: 'FORBIDDEN',
        });
    }
    next();
};

/**
 * Optional authentication (proceeds even without token)
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;
        if (!token) return next();

        const { valid, decoded } = verifyAccessToken(token);
        if (valid) {
            const user = await User.findById(decoded.id).select('-password');
            if (user && user.isActive) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        next(); // Continue without auth on error
    }
};

module.exports = { authenticate, requireAdmin, optionalAuth };

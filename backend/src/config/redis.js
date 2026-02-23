const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
    try {
        const options = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            lazyConnect: true,
        }

        if (process.env.REDIS_PASSWORD) {
            options.password = process.env.REDIS_PASSWORD;
        }

        redisClient = new Redis(options);

        await redisClient.connect()

        redisClient.on('error', (err) => {
            logger.error('Redis error:', err.message);
        });

        redisClient.on('connect', () => {
            logger.info('Redis client connected');
        });

        redisClient.on('reconnecting', () => {
            logger.warn('Redis client reconnecting...');
        });

        // Test connection
        await redisClient.ping();
        logger.info('Redis ping successful');

        return redisClient;
    } catch (error) {
        logger.error(`Redis connection failed:${error.message}`)
        // In development, allow app to run without Redis (fallback to in-memory)
        if (process.env.NODE_ENV === 'development') {
            logger.warn('⚠️  Running without Redis - using in-memory fallback for refresh tokens')
            redisClient = createInMemoryFallback();
            return redisClient;
        }
        throw error
    }
}

// In-Memory fallback for development without Redis
const createInMemoryFallback = () => {
    const store = new Map();
    return {
        set: async (key, value, ...args) => {
            let ttl = null;
            for (let i = 0; i < args.length; i++) {
                if (args[i] === 'EX') ttl = parseInt(args[i + 1]) * 1000;
            }
            const entry = { value, expires: ttl ? Date.now() + ttl : null };
            store.set(key, entry);
            return "OK"
        },
        get: async (key) => {
            const entry = store.get(key);
            if (!entry) return null;
            if (entry.expires && Date.now() > entry.expires) {
                store.delete(key);
                return null;
            }
            return entry.value;
        },
        del: async (key) => {
            store.delete(key);
            return 1
        },
        ping: async () => 'PONG',
        keys: async (pattern) => {
            const regex = new RegExp(pattern.replace('*', '.*')); // if pattern is tt return /tt/
            return Array.from(store.keys()).filter(k => regex.test(k))
        },
        on: () => { }
    }
}

const getRedisClient = () => {
    if (!redisClient) throw new Error('Redis client not initialized')
    return redisClient
}

module.exports = { connectRedis, getRedisClient };

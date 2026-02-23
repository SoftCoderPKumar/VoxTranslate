const express = require('express');
const cors = require('cors')
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit')
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const translationRoutes = require('./routes/translationRoutes');
const userRoutes = require('./routes/userRoutes')
const { errorHandler } = require('./middleware/errorHandler')
const logger = require('./utils/logger');


const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');



const app = express();

// Serve the Swagger UI at the /api-docs route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "wss:", "ws:"],
            mediaSrc: ["'self'", "blob:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

//CORS Configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

//Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: { error: 'Too many request from this IP, Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
})
app.use('/api', limiter);

// Auth routes get stricter rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many auth attempts, please try again later.' }
});
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

//Body parsing
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }))

//cookie parsing
app.use(cookieParser(process.env.COOKIE_SECRET));

//Logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', {
        // skip: function (req, res) { return res.statusCode < 400 },
        stream: { write: (message) => logger.info(message.trim()) },

    }))
}

//Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    })
})

//API Requests
app.use('/api/auth', authRoutes);
app.use('/api/translate', translationRoutes);
app.use('/api/user', userRoutes);




// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' })
})

//Global error Handler
app.use(errorHandler);
module.exports = app;

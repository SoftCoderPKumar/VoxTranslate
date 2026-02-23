require('dotenv').config();
const http = require("http")
const app = require("./app")
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { initWebSocket } = require("./services/websocketService")
const logger = require("./utils/logger")

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // connect to MongoDB
        await connectDB()
        logger.info('✅ MongoDB connected successfully')

        //connect to redis
        await connectRedis();
        logger.info('✅ Redis connected successfully')

        //Create HTTP server
        const server = http.createServer(app)

        //initialize WebSocket for real-time audio streaming
        await initWebSocket(server);

        logger.info('✅ WebSocket server initialized')
        server.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode URL: http://localhost:${PORT}`)
            logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
        })

        //Graceful shutdown
        process.on('SIGTERM', async () => {
            logger.info('SIGTERM received. shutting down gracefully...');
            server.close(() => {
                logger.info('HTTP server closed');
                process.exit(0);
            });
        });

        process.on('unhandledRejection', (err) => {
            logger.error('Unhandled Promise Rejection:', err);
            server.close(() => process.exit(1));
        })

    } catch (error) {
        logger.error('Failed to start server:', error)
        process.exit(1)
    }
}

startServer();
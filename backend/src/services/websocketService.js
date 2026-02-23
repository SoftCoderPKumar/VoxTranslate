const WebSocket = require('ws');
const { verifyAccessToken } = require('../utils/tokenUtils')
const logger = require('../utils/logger')

let wss = null;

const initWebSocket = (server) => {
    wss = new WebSocket.Server({
        server,
        path: '/ws',
        maxPayload: 1024 * 1024 * 50 // 50mb
    })

    wss.on('connection', (ws, req) => {
        // Authenticate via query parameter (token passed during WS handshake)
        const url = new URL(req.url, `http://${req.headers.host}`);
        const token = url.searchParams.get('token');

        if (!token) {
            ws.close(1008, 'Authentication required');
            return;
        }

        const { valid, decoded } = verifyAccessToken(token)
        if (!valid) {
            ws.close(1008, 'Invalid token');
            return;
        }

        ws.userId = decoded.id;
        ws.isAlive = true;
        ws.audioChunks = [];
        ws.targetLanguage = 'en';
        ws.sourceLanguage = 'auto';

        logger.info(`webSocket connection established for user: ${decoded.id}`)

        ws.on('pong', () => { ws.isAlive = true });

        ws.on('message', async (data) => {
            try {
                // Text messages are control messages (JSON)
                if (typeof data === 'string' || data.constructor === String) {
                    handleControlMessage(ws, JSON.parse(data.toString()));
                    return;
                }

                // Binary data is audio chunks
                if (Buffer.isBuffer(data) || data instanceof ArrayBuffer) {
                    ws.audioChunks.push(Buffer.isBuffer(data) ? data : Buffer.from(data));
                    ws.send(JSON.stringify({ type: 'chunk_received', size: data.length || data.byteLength }));
                }
            } catch (error) {
                logger.error('WebSocket message error:', err);
                ws.send(JSON.stringify({ type: 'error', message: err.message }));
            }
        });

        ws.on('close', (code, reason) => {
            logger.info(`WebSocket closed for user ${ws.userId}: ${code} - ${reason}`);
        });

        ws.on('error', (err) => {
            logger.error(`WebSocket error for user ${ws.userId}:`, err);
        });

        // Send ready message
        ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket ready for audio streaming' }));
    })

    // Heartbeat to keep connections alive
    const heartbeat = setInterval(() => {
        if (!wss) return;
        wss.clients.forEach((ws) => {
            if (!ws.isAlive) {
                ws.terminate();
                return;
            }
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', () => clearInterval(heartbeat));
    logger.info('WebSocket server initialized at /ws');
}

const handleControlMessage = (ws, message) => {
    switch (message.type) {
        case 'config':
            ws.targetLanguage = message.targetLanguage || 'en';
            ws.sourceLanguage = message.sourceLanguage || 'auto';
            ws.send(JSON.stringify({ type: 'config_applied', targetLanguage: ws.targetLanguage }));
            break;

        case 'start_recording':
            ws.audioChunks = [];
            ws.isRecording = true;
            ws.send(JSON.stringify({ type: 'recording_started' }));
            break;

        case 'stop_recording':
            ws.isRecording = false;
            ws.send(JSON.stringify({
                type: 'recording_stopped',
                chunksCollected: ws.audioChunks.length,
                totalBytes: ws.audioChunks.reduce((sum, c) => sum + c.length, 0),
            }));
            break;

        case 'clear_audio':
            ws.audioChunks = [];
            ws.send(JSON.stringify({ type: 'audio_cleared' }));
            break;

        case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;

        default:
            ws.send(JSON.stringify({ type: 'unknown_command', received: message.type }));
    }
};

const getWss = () => wss;

module.exports = { initWebSocket, getWss };
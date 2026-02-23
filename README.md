# 🎙️ VoxTranslate — Real-Time AI Audio Translator

> Break language barriers with AI-powered real-time voice translation

![VoxTranslate Banner](https://img.shields.io/badge/VoxTranslate-v1.0.0-FF6B1A?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=flat-square&logo=mongodb)
![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?style=flat-square&logo=redis)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Prerequisites](#prerequisites)
6. [Installation & Setup](#installation--setup)
7. [Environment Variables](#environment-variables)
8. [Running the Application](#running-the-application)
9. [API Documentation](#api-documentation)
10. [Security Implementation](#security-implementation)
11. [Frontend Pages](#frontend-pages)
12. [Docker Deployment](#docker-deployment)
13. [Project Structure](#project-structure)
14. [Troubleshooting](#troubleshooting)

---

## 🌟 Overview

VoxTranslate is a full-stack, production-grade real-time audio translation application. Users can record their voice and receive instant translations into 70+ languages powered by OpenAI's Whisper (speech-to-text) and GPT-4 (translation) APIs.

The application features a secure authentication system using JWT access tokens and Redis-cached refresh tokens, with all tokens stored in HttpOnly secure cookies to prevent XSS attacks.

---

## ✨ Features

### Core Translation Features
- 🎤 **Real-time voice recording** with browser MediaRecorder API
- 🔊 **Browser speech recognition** for live transcription display during recording
- 📝 **Text translation** mode for typing/pasting text
- 🌍 **70+ languages** with automatic language detection
- 🔄 **Language swapping** to reverse translation direction
- 📣 **Text-to-speech** playback of translations
- 📋 **Copy to clipboard** for translated text

### Authentication & Security
- 🔐 **Secure cookie-based JWT** — access tokens in HttpOnly cookies
- 🔄 **Redis refresh tokens** — stored in Redis with automatic rotation
- 🛡️ **Password strength meter** with real-time feedback
- 🔒 **AES-256 encrypted API keys** — never stored in plaintext
- ⚡ **Rate limiting** on all API endpoints
- 🪖 **Helmet.js security headers** for all responses

### Account Management
- 👤 User registration with email validation
- 🔑 OpenAI API key management (encrypted storage)
- 📊 Translation count tracker
- 📚 Searchable & filterable translation history
- 🗑️ Delete individual translations
- 🔑 Password change with session invalidation

### UI/UX
- 🎨 Orange + Green color scheme with dark mode
- 📱 Fully responsive (mobile-first)
- ⚡ Animated waveform during recording
- 🚀 Smooth page transitions and micro-animations
- 📄 About, Terms & Conditions, and 404 pages

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                        │
│   React SPA (Bootstrap 5, Custom CSS)                   │
│   ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│   │  MediaRecorder│  │ SpeechRecog. │  │  Axios API   │  │
│   │  (Audio)    │  │  (Transcript)│  │  (HttpOnly   │  │
│   └──────┬──────┘  └──────┬───────┘  │   cookies)   │  │
│          │                │          └──────┬─────────┘  │
└──────────┼────────────────┼─────────────────┼────────────┘
           │ Multipart/Form │                 │ REST API
           │ Audio Blob     │                 │ + Cookie
           ▼                                  ▼
┌─────────────────────────────────────────────────────────┐
│                Express.js Backend                        │
│                                                         │
│   ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│   │ Auth Router  │  │ Translation  │  │ User Router │ │
│   │ /api/auth    │  │ /api/translate│  │ /api/user   │ │
│   └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
│          │                 │                   │         │
│   ┌──────▼─────────────────▼───────────────────▼──────┐ │
│   │           Authentication Middleware (JWT)          │ │
│   └──────────────────────────────────────────────────┘ │
│                                                         │
│   ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│   │  WebSocket   │  │   Multer     │  │   Winston   │ │
│   │  Server (/ws)│  │ Audio Upload │  │   Logger    │ │
│   └──────────────┘  └──────────────┘  └─────────────┘ │
└────────────┬─────────────────┬──────────────────────────┘
             │                 │
     ┌───────▼──┐        ┌─────▼──────┐
     │ MongoDB  │        │   Redis    │
     │          │        │            │
     │ - Users  │        │ refresh_   │
     │ - Transl.│        │ token:{id} │
     └──────────┘        └────────────┘
             │
     ┌───────▼──────────┐
     │   OpenAI API     │
     │ - Whisper (STT)  │
     │ - GPT-4 (Trans.) │
     └──────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | SPA framework |
| UI Library | Bootstrap 5 | Responsive layout |
| Icons | Bootstrap Icons | Icon set |
| HTTP Client | Axios | API requests with interceptors |
| Routing | React Router v6 | Client-side routing |
| Notifications | React Hot Toast | Toast notifications |
| Backend | Node.js 20 + Express.js | REST API server |
| Database | MongoDB + Mongoose | User & translation data |
| Cache | Redis (ioredis) | Refresh token storage |
| Authentication | JWT + Cookies | Secure token auth |
| Security | Helmet.js, CORS, Rate Limit | API security |
| AI - Speech | OpenAI Whisper | Audio transcription |
| AI - Translation | OpenAI GPT-4o-mini | Text translation |
| Real-time | WebSocket (ws) | Audio streaming |
| Logging | Winston | Structured logging |
| Validation | express-validator | Input validation |
| Containerization | Docker + Docker Compose | Deployment |

---

## 📦 Prerequisites

Before running this application, ensure you have:

- **Node.js** v18+ ([download](https://nodejs.org))
- **npm** v8+ (comes with Node.js)
- **MongoDB** v7+ running locally OR MongoDB Atlas connection string
- **Redis** v7+ running locally OR Redis Cloud instance
- **OpenAI API Key** (optional but recommended for AI translation)

### Quick check:
```bash
node --version    # Should be v18+
npm --version     # Should be v8+
mongod --version  # Should be v7+
redis-cli ping    # Should return PONG
```

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/audio-translator.git
cd audio-translator
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
```

Edit `backend/.env` with your configuration (see [Environment Variables](#environment-variables))

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB - Local or Atlas
MONGODB_URI=mongodb://localhost:27017/audio_translator
# For Atlas: mongodb+srv://user:pass@cluster.mongodb.net/audio_translator

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=          # Leave empty if no auth

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_chars_change_me
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars_change_me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cookie Settings
COOKIE_SECRET=your_cookie_secret_min_32_chars
COOKIE_SECURE=false          # Set true in production (HTTPS only)
COOKIE_SAME_SITE=lax         # Use 'strict' in production

# CORS - Your frontend URL
FRONTEND_URL=http://localhost:3000

# OpenAI (optional system-level key; users can add their own)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000   # 15 minutes
RATE_LIMIT_MAX=100             # requests per window

# API Key Encryption (MUST be exactly 32 characters!)
ENCRYPTION_KEY=your_32_character_encryption_key!!
```

> ⚠️ **Security Warning**: Never commit `.env` files to version control. The `.env.example` file is safe to commit.

---

## 🏃 Running the Application

### Development Mode (Recommended for local development)

**Terminal 1 - Start MongoDB:**
```bash
mongod --dbpath /usr/local/var/mongodb   # macOS
# OR
sudo systemctl start mongod               # Linux
```

**Terminal 2 - Start Redis:**
```bash
redis-server                              # macOS/Linux
```

**Terminal 3 - Start Backend:**
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
# WebSocket at ws://localhost:5000/ws
```

**Terminal 4 - Start Frontend:**
```bash
cd frontend
npm start
# App opens at http://localhost:3000
```

### Quick Start Script
```bash
# From project root, if you have concurrently installed:
npm install -g concurrently
concurrently "cd backend && npm run dev" "cd frontend && npm start"
```

---

## 📡 API Documentation

All API endpoints are prefixed with `/api/`.

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:** Sets `accessToken` and `refreshToken` HttpOnly cookies.
```json
{
  "message": "Registration successful",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "hasApiKey": false,
    "translationCount": 0
  }
}
```

---

#### POST `/api/auth/login`
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:** Sets auth cookies. Returns user object.

---

#### POST `/api/auth/refresh`
Refresh the access token using the refresh token cookie.

**Cookies Required:** `refreshToken`

**Behavior:**
- Verifies refresh token exists in Redis
- Revokes old refresh token (rotation)
- Issues new access token + new refresh token
- Sets new cookies

---

#### POST `/api/auth/logout`
Log out and revoke refresh token.

**Behavior:** Deletes refresh token from Redis, clears cookies.

---

#### GET `/api/auth/me` 🔒
Get the currently authenticated user.

**Response:**
```json
{
  "user": { "id": "...", "name": "...", "email": "..." }
}
```

---

### Translation Endpoints (All require authentication 🔒)

#### GET `/api/translate/languages`
Get all supported languages.

**Response:**
```json
{
  "languages": [
    { "code": "en", "name": "English" },
    { "code": "es", "name": "Spanish" },
    ...
  ]
}
```

---

#### POST `/api/translate/text`
Translate text using AI.

**Request Body:**
```json
{
  "text": "Hello, how are you?",
  "targetLanguage": "es",
  "sourceLanguage": "auto"
}
```

**Response:**
```json
{
  "translatedText": "Hola, ¿cómo estás?",
  "detectedLanguage": "en",
  "detectedLanguageName": "English",
  "confidence": 0.98,
  "translationId": "..."
}
```

---

#### POST `/api/translate/audio`
Transcribe audio then translate using OpenAI Whisper + GPT.

**Request:** `multipart/form-data`
- `audio` (file) — Audio blob (webm, ogg, mp4, wav, etc.)
- `targetLanguage` (string) — Target language code
- `sourceLanguage` (string, optional) — Source language code or 'auto'

**Response:**
```json
{
  "originalText": "Hello, how are you?",
  "translatedText": "Hola, ¿cómo estás?",
  "detectedLanguage": "en",
  "detectedLanguageName": "English",
  "translationId": "..."
}
```

---

#### GET `/api/translate/history`
Get paginated translation history.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `targetLanguage` (string, optional) — Filter by language

---

#### DELETE `/api/translate/history/:id`
Delete a specific translation from history.

---

### User Endpoints (All require authentication 🔒)

#### PUT `/api/user/api-key`
Save an OpenAI API key (encrypted before storage).

**Request Body:**
```json
{
  "apiKey": "sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "provider": "openai"
}
```

**Behavior:** Validates the key by making a test API call before saving.

---

#### DELETE `/api/user/api-key`
Remove the stored API key.

---

#### PUT `/api/user/profile`
Update user profile information.

---

#### PUT `/api/user/password`
Change password (forces re-login by revoking all refresh tokens).

---

## 🔒 Security Implementation

### Cookie Security
```
accessToken:  HttpOnly=true, Secure=true(prod), SameSite=strict(prod), MaxAge=15min, Path=/
refreshToken: HttpOnly=true, Secure=true(prod), SameSite=strict(prod), MaxAge=7days, Path=/api/auth
```

### JWT Token Flow
```
1. Login → Generate accessToken (JWT, 15min) + refreshToken (UUID, 7days)
2. Store refreshToken UUID in Redis with TTL
3. Set both as HttpOnly cookies
4. Requests → accessToken verified on each request
5. accessToken expires → auto-refresh via /api/auth/refresh
6. refreshToken verified in Redis → rotate (delete old, create new)
7. Logout → delete refreshToken from Redis, clear cookies
```

### Redis Key Pattern
```
refresh_token:{uuid} → JSON { userId, tokenId, createdAt }  TTL: 7 days
```

### API Key Encryption
```
Algorithm: AES-256-CBC
Key: 32-byte from ENCRYPTION_KEY env variable
IV: Random 16 bytes per encryption
Stored: iv_hex:encrypted_hex
```

### Rate Limiting
- Global API: 100 requests / 15 minutes / IP
- Login endpoint: 10 requests / 15 minutes / IP  
- Register endpoint: 10 requests / 15 minutes / IP

---

## 📱 Frontend Pages

| Route | Page | Auth Required |
|-------|------|---------------|
| `/` | Home Page (landing) | No |
| `/login` | Login | No (redirects if logged in) |
| `/signup` | Sign Up | No (redirects if logged in) |
| `/translate` | **Translator (main feature)** | **Yes** |
| `/history` | Translation History | **Yes** |
| `/settings` | Account Settings & API Key | **Yes** |
| `/about` | About VoxTranslate | No |
| `/terms` | Terms & Conditions | No |
| `/*` | 404 Not Found | No |

---

## 🐳 Docker Deployment

### Quick Start with Docker Compose
```bash
# Clone and configure
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f backend

# Stop everything
docker-compose down
```

### Services
- **MongoDB**: `localhost:27017`
- **Redis**: `localhost:6379`
- **Backend API**: `localhost:5000`
- **Frontend**: `localhost:3000`

### Production Deployment
```bash
# Set production environment
NODE_ENV=production
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict

# Build with production optimizations
docker-compose -f docker-compose.prod.yml up --build -d
```

---

## 📁 Project Structure

```
audio-translator/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js        # MongoDB connection
│   │   │   └── redis.js           # Redis connection + fallback
│   │   ├── controllers/
│   │   │   ├── authController.js  # Register, login, refresh, logout
│   │   │   ├── translationController.js  # Text & audio translation
│   │   │   └── userController.js  # Profile, API key, password
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT authentication middleware
│   │   │   └── errorHandler.js    # Global error handler
│   │   ├── models/
│   │   │   ├── User.js            # User model (bcrypt, encryption)
│   │   │   └── Translation.js     # Translation history model
│   │   ├── routes/
│   │   │   ├── authRoutes.js      # /api/auth/*
│   │   │   ├── translationRoutes.js  # /api/translate/*
│   │   │   └── userRoutes.js      # /api/user/*
│   │   ├── services/
│   │   │   └── websocketService.js  # WebSocket for audio streaming
│   │   ├── utils/
│   │   │   ├── tokenUtils.js      # JWT + Redis token management
│   │   │   └── logger.js          # Winston logger
│   │   ├── app.js                 # Express app configuration
│   │   └── server.js              # Server entry point
│   ├── .env.example               # Environment template
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js          # Navigation bar
│   │   ├── context/
│   │   │   └── AuthContext.js     # Global auth state
│   │   ├── pages/
│   │   │   ├── HomePage.js        # Landing page
│   │   │   ├── LoginPage.js       # Login form
│   │   │   ├── SignupPage.js      # Registration form
│   │   │   ├── TranslatorPage.js  # Main translator
│   │   │   ├── HistoryPage.js     # Translation history
│   │   │   ├── SettingsPage.js    # Settings & API key
│   │   │   ├── AboutPage.js       # About page
│   │   │   ├── TermsPage.js       # Terms & conditions
│   │   │   └── NotFoundPage.js    # 404 page
│   │   ├── styles/
│   │   │   └── global.css         # Global styles & CSS variables
│   │   ├── utils/
│   │   │   └── api.js             # Axios with auto-refresh interceptor
│   │   └── App.js                 # Router & app shell
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docs/
│   └── README.md                  # This file
├── docker-compose.yml
└── README.md
```

---

## 🔧 Troubleshooting

### Issue: Microphone not working
- Ensure browser has microphone permissions
- Chrome requires HTTPS for microphone in production
- Check browser console for MediaRecorder errors
- Try a different browser (Chrome recommended)

### Issue: Translation failing with "No API key"
1. Go to Settings page (`/settings`)
2. Add your OpenAI API key
3. The key will be validated before saving
4. Get a key at: https://platform.openai.com/api-keys

### Issue: Redis connection failed in development
The app includes an **in-memory fallback** for Redis in development mode.
Refresh tokens will work but won't persist across server restarts.
For production, always use a real Redis instance.

### Issue: MongoDB connection failed
```bash
# Start MongoDB
mongod --dbpath /data/db    # Linux/macOS
# OR use MongoDB Atlas and update MONGODB_URI in .env
```

### Issue: CORS errors
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL exactly
- For development: `FRONTEND_URL=http://localhost:3000`

### Issue: Tokens not being sent
- Ensure `withCredentials: true` is set in Axios (already configured in `src/utils/api.js`)
- Ensure backend CORS has `credentials: true` (already configured)
- Ensure you're running on the same domain in production

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) for Whisper and GPT APIs
- [MongoDB](https://mongodb.com) for the database
- [Redis](https://redis.io) for the caching layer
- [Bootstrap](https://getbootstrap.com) for the UI framework
- All contributors and users of VoxTranslate

---

*Built with ❤️ and ☕ by the VoxTranslate team*

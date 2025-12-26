// server/src/server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { auth } from 'express-oauth2-jwt-bearer';

dotenv.config();
const app = express();

// ⭐ ES Modules এর জন্য __dirname তৈরি করা
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- PORT ---
const PORT = process.env.PORT || 10000;

// --- CORS ---
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'capacitor://localhost',
    'https://onyx-drift-app.pages.dev',
    'https://onyx-drift.com'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}));

app.use(express.json());

// --- Auth0 JWT Middleware ---
const AUTH0_AUDIENCE = 'https://onyx-drift-api.com';
const AUTH0_ISSUER_BASE_URL = 'https://dev-6d0nxccsaycctfl1.us.auth0.com/';

const jwtCheck = auth({
    audience: AUTH0_AUDIENCE,
    issuerBaseURL: AUTH0_ISSUER_BASE_URL,
    tokenSigningAlg: 'RS256'
});

// =====================
// API Routes
// =====================

// 1️⃣ Public route
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to OnyxDrift API Server. Status: Online' });
});

// 2️⃣ Protected route
app.get('/api/posts', jwtCheck, (req, res) => {
    const userId = req.auth.payload.sub;
    res.json({
        message: "Successfully retrieved protected posts data!",
        user_id_from_token: userId,
        data: [
            { id: 1, title: "First Protected Post", author: "User " + userId.slice(-4) },
            { id: 2, title: "Second Protected Post", author: "Admin" }
        ]
    });
});

// 3️⃣ Profile API (temporary demo version)
app.get('/api/profile/:userId', (req, res) => {
    const { userId } = req.params;
    res.json({
        userId,
        name: "Naimus Shakib",
        email: "naimusshakib582@gmail.com",
        avatar: "https://via.placeholder.com/150",
    });
});

app.put('/api/profile/:userId', (req, res) => {
    const { userId } = req.params;
    const { name, avatar } = req.body;
    res.json({
        userId,
        name,
        avatar,
        message: "Profile updated successfully",
    });
});

// =====================
// Static file serving + Frontend routing fallback
// =====================
const buildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(buildPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

// =====================
// Start server
// =====================
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import { auth } from 'express-oauth2-jwt-bearer';
import profileRoutes from "./src/routes/profile.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- CORS Configuration ---
const allowedOrigins = [
    'https://www.onyx-drift.com',
    'https://onyx-drift.com',
    'https://onyx-drift-app-final.onrender.com',
    'http://localhost:5173'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

// --- Auth0 Middleware ---
const jwtCheck = auth({
    audience: process.env.AUTH0_AUDIENCE || 'https://onyx-drift-api.com',
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || 'https://dev-6d0nxccsaycctfl1.us.auth0.com/',
    tokenSigningAlg: 'RS256'
});

// --- API Routes ---
app.use("/api/profile", profileRoutes);

// --- Static Files (React Build) ---
// Vite বিল্ড করার পর ফাইলগুলো 'client/dist' এ থাকে
const buildPath = path.join(__dirname, "../client/dist");
app.use(express.static(buildPath));

app.get("*", (req, res) => {
    // যদি API রুট না হয়, তবে index.html ফাইল পাঠাবে
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(buildPath, "index.html"));
    }
});

// --- Server Start ---
// Render-এর জন্য '0.0.0.0' ব্যবহার করা জরুরি
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
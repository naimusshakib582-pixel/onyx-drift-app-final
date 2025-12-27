import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { auth } from 'express-oauth2-jwt-bearer';
import profileRoutes from "./src/routes/profile.js";

dotenv.config();

const app = express();

// --- Auth0 কনফিগারেশন ---
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || 'https://onyx-drift-api.com'; 
const AUTH0_ISSUER_BASE_URL = process.env.AUTH0_ISSUER_BASE_URL || 'https://dev-6d0nxccsaycctfl1.us.auth0.com/'; 

const jwtCheck = auth({
    audience: AUTH0_AUDIENCE,
    issuerBaseURL: AUTH0_ISSUER_BASE_URL,
    tokenSigningAlg: 'RS256'
});

// --- CORS কনফিগারেশন ---
const allowedOrigins = [
    'https://c32dbd3f.onyx-drift-app.pages.dev', 
    'http://localhost:5173', 
    'http://localhost:3000', 
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json()); 

// --- রুট রাউট (Health Check) ---
app.get('/', (req, res) => {
    res.status(200).send("OnyxDrift Backend Server is Live and Operational!");
});

// --- API রাউটস ---

// ✅ ১. প্রোফাইল রাউট মাউন্ট করা (এটি আপনার 404 এরর ঠিক করবে)
// ব্রাউজারে টেস্ট করার জন্য এটি jwtCheck ছাড়া রাখা হয়েছে
app.use("/api/profile", profileRoutes); 

// ২. সুরক্ষিত রুট (টোকেন ছাড়া এটি কাজ করবে না)
app.get('/api/posts', jwtCheck, (req, res) => {
    const userId = req.auth.payload.sub; 
    res.status(200).json({ 
        message: "Successfully retrieved protected posts data!", 
        user_id_from_token: userId,
        data: [{ id: 1, title: "Protected Post" }] 
    });
});

// সার্ভার পোর্ট সেটআপ
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🔗 Test Profile: http://localhost:${PORT}/api/profile/test123`);
});
// client/src/server.js

// প্রয়োজনীয় মডিউল আমদানি করুন
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Auth0 JWT Bearer মিডলওয়্যার আমদানি করুন
const { auth } = require('express-oauth2-jwt-bearer');

// .env ফাইল লোড করুন
dotenv.config();

const app = express();

// --- পরিবেশ ভেরিয়েবল ---
const PORT = process.env.PORT || 10000; 

// --- CORS কনফিগারেশন ---
// এখানে আপনার সমস্ত অনুমোদিত ফ্রন্টএন্ড URL যোগ করুন
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', // যদি Vite ব্যবহার করেন
    'capacitor://localhost',
    'https://onyx-drift-app.pages.dev', // ⭐ আপনার লাইভ Cloudflare URL
];

const corsOptions = {
    origin: (origin, callback) => {
        // যদি origin অনুমোদিত তালিকায় থাকে অথবা যদি এটি একটি ব্রাউজার-বিহীন অনুরোধ হয়
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`)); // ত্রুটি মেসেজ উন্নত করা হলো
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json()); // JSON অনুরোধের বডি পার্স করার জন্য

// --- Auth0 JWT ভেরিফিকেশন মিডলওয়্যার ---
// Auth0 ড্যাশবোর্ডে API সেকশন থেকে Identifier নিন
const AUTH0_AUDIENCE = 'https://onyx-drift-api.com'; // ✅ আপনার সঠিক API Identifier
const AUTH0_ISSUER_BASE_URL = 'https://dev-6d0nxccsaycctfl1.us.auth0.com/'; // আপনার Auth0 Domain

// টোকেন যাচাই করার মিডলওয়্যার তৈরি
const jwtCheck = auth({
    audience: AUTH0_AUDIENCE,
    issuerBaseURL: AUTH0_ISSUER_BASE_URL,
    tokenSigningAlg: 'RS256'
});

// --- API রুটস ---

// 1. পাবলিক রুট (আন-সুরক্ষিত)
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the OnyxDrift API Server. Status: Online' });
});

// 2. সুরক্ষিত রুট (Protected Route)
// jwtCheck মিডলওয়্যার যোগ করা হয়েছে। এই রুটে প্রবেশ করতে হলে বৈধ Auth0 টোকেন লাগবে।
app.get('/posts', jwtCheck, (req, res) => {
    // টোকেন বৈধ হলে তবেই এই কোড চলবে
    console.log("Protected /posts route accessed successfully.");
    
    // Auth0 ইউজার ID, টোকেনের পেলোড থেকে পাওয়া যায়
    const userId = req.auth.payload.sub; 

    // ⭐ এখানে আপনার আসল ডাটাবেস লজিক (MongoDB থেকে ডেটা আনা) যুক্ত করুন।
    res.status(200).json({ 
        message: "Successfully retrieved protected posts data!", 
        user_id_from_token: userId,
        data: [
            { id: 1, title: "First Protected Post", author: "User " + userId.slice(-4) },
            { id: 2, title: "Second Protected Post", author: "Admin" }
        ] 
    });
});

// --- সার্ভার চালু করুন ---
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    // রেন্ডারে এটি 10000 দেখাবে
});
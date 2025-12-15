// client/src/server.js

// প্রয়োজনীয় মডিউল আমদানি করুন
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// ফাইল এবং পাথ হ্যান্ডেল করার জন্য 'path' আমদানি করা হলো
const path = require('path'); 

// Auth0 JWT Bearer মিডলওয়্যার আমদানি করুন
const { auth } = require('express-oauth2-jwt-bearer');

// .env ফাইল লোড করুন
dotenv.config();

const app = express();

// --- পরিবেশ ভেরিয়েবল ---
const PORT = process.env.PORT || 10000; 

// --- CORS কনফিগারেশন ---
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', 
    'capacitor://localhost',
    'https://onyx-drift-app.pages.dev',
    // Render URL টি সাধারণত এখানে যুক্ত করার দরকার নেই যদি এটি একই ডোমেইনের নিচে থাকে,
    // কিন্তু যদি এটি একটি ভিন্ন URL হয়, তবে এখানে যুক্ত করুন।
    // 'https://onyx-drift-app-final.onrender.com' 
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
app.use(express.json()); // JSON অনুরোধের বডি পার্স করার জন্য

// --- Auth0 JWT ভেরিফিকেশন মিডলওয়্যার ---
const AUTH0_AUDIENCE = 'https://onyx-drift-api.com'; 
const AUTH0_ISSUER_BASE_URL = 'https://dev-6d0nxccsaycctfl1.us.auth0.com/'; 

const jwtCheck = auth({
    audience: AUTH0_AUDIENCE,
    issuerBaseURL: AUTH0_ISSUER_BASE_URL,
    tokenSigningAlg: 'RS256'
});

// --- API রুটস ---

// 1. পাবলিক রুট (আন-সুরক্ষিত)
// এই রুটটি / রিকোয়েস্ট হ্যান্ডেল করবে, যা সাধারণত API স্ট্যাটাস দেখায়
app.get('/api', (req, res) => { // রুটটি / থেকে /api-তে পরিবর্তন করা হলো যাতে এটি ফ্রন্টএন্ড / রুটকে ব্লক না করে
    res.json({ message: 'Welcome to the OnyxDrift API Server. Status: Online' });
});


// 2. সুরক্ষিত রুট (Protected Route)
app.get('/api/posts', jwtCheck, (req, res) => { // রুটটি /posts থেকে /api/posts-এ পরিবর্তন করা হলো
    console.log("Protected /api/posts route accessed successfully.");
    const userId = req.auth.payload.sub; 

    res.status(200).json({ 
        message: "Successfully retrieved protected posts data!", 
        user_id_from_token: userId,
        data: [
            { id: 1, title: "First Protected Post", author: "User " + userId.slice(-4) },
            { id: 2, title: "Second Protected Post", author: "Admin" }
        ] 
    });
});

// ⭐⭐⭐ স্ট্যাটিক ফাইল পরিবেশন এবং ফ্রন্টএন্ড রাউটিং ফলব্যাক ⭐⭐⭐

// যেহেতু আপনার package.json এ "type": "module" নেই, তাই আমরা CommonJS পদ্ধতিতে __dirname ব্যবহার করছি।
// যদি আপনি Vite ব্যবহার করেন, তবে বিল্ড ডিরেক্টরি সাধারণত 'dist' হয়। 
// যেহেতু server.js src/ ফোল্ডারের ভেতরে আছে, তাই আমরা দুটি ডিরেক্টরি উপরে গিয়ে dist ফোল্ডারে পৌঁছাব।

const buildPath = path.join(__dirname, '..', 'dist'); // এটি আপনার src থেকে প্রজেক্টের রুট/dist ফোল্ডার দেখাবে

// 3. স্ট্যাটিক ফাইল পরিবেশন
// এটি Express কে বলবে dist ফোল্ডারে থাকা সমস্ত CSS, JS, ছবি ইত্যাদি পরিবেশন করতে।
app.use(express.static(buildPath));

// 4. ক্লায়েন্ট-সাইড রাউটিং-এর জন্য ক্যাচ-অল রুট (ফলব্যাক)
// সকল GET অনুরোধ যা উপরে কোনো API রুট বা স্ট্যাটিক ফাইলের সাথে ম্যাচ করেনি, তাদের জন্য index.html পরিবেশন করুন।
// এই রুটটি সকল API রুটের 'পরে' এবং সার্ভার লিসেনিং কোডের 'আগে' থাকতে হবে।
app.get('*', (req, res) => {
    // index.html ফাইলটি dist ফোল্ডারের মধ্যে থাকবে
    res.sendFile(path.join(buildPath, 'index.html'));
});

// --- সার্ভার চালু করুন ---
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
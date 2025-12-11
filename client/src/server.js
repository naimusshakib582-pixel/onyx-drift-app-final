// src/server.js
import 'dotenv/config'; // .env ফাইল লোড করার জন্য
import express from 'express';
import mongoose from 'mongoose'; // MongoDB এর জন্য
import cors from 'cors';
import * as admin from 'firebase-admin'; // 💡 Firebase Admin SDK
import path from 'path';
import { fileURLToPath } from 'url';

// 💡 আপনার routes/auth.js ইমপোর্ট করুন
import authRouter from './routes/auth.js'; 


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;
const express = require('express');
const cors = require('cors'); // cors প্যাকেজ ইমপোর্ট করুন
const app = express();

// Whitelist-এ আপনার অনুমোদিত ডোমেইনগুলো রাখুন
const allowedOrigins = [
    'https://00b8ea48.onyx-drift-app.pages.dev', // আপনার Cloudflare Pages লাইভ ডোমেইন
    'http://localhost:3000', // লোকাল ডেভেলপমেন্টের জন্য
    'capacitor://localhost' // যদি মোবাইল সাপোর্ট থাকে
    // ভবিষ্যতে কাস্টম ডোমেইন থাকলে এখানে যোগ করুন
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // অনুমোদিত মেথড
    credentials: true, // কুকিজ, অথরাইজেশন হেডার পাস করার জন্য
};

// CORS মিডলওয়্যার ব্যবহার করুন
app.use(cors(corsOptions)); 

// এর নিচে আপনার অন্যান্য মিডলওয়্যার এবং রাউটগুলো থাকবে
// app.use(express.json());
// app.use('/api/login', loginRouter);

// =======================================================
// 1. MongoDB কানেকশন
// =======================================================
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully!');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
};
connectDB();

// =======================================================
// 2. Firebase Admin SDK কনফিগারেশন
// =======================================================
// 🚨 গুরুত্বপূর্ণ: Render এ ফাইল আপলোড এড়াতে, আপনি আপনার Service Account JSON 
// কে একটি এনভায়রনমেন্ট ভ্যারিয়েবল (যেমন FIREBASE_SERVICE_ACCOUNT) হিসেবে সেভ করতে পারেন।
// তবে সুবিধার জন্য, আমরা ধরে নিচ্ছি আপনার serviceAccount.json ফাইলটি src/config/ এ আছে।

const serviceAccountPath = path.resolve(__dirname, 'config', 'serviceAccount.json'); 

try {
    // 🚨 আপনি যদি .gitignore এ serviceAccount.json রাখেন, তবে Render এটিকে পাবে না। 
    // Render এ ডিপ্লয় করার জন্য আপনাকে Service Account JSON এর content কে 
    // একটি এনভায়রনমেন্ট ভ্যারিয়েবল (যেমন FIREBASE_SERVICE_ACCOUNT) এ বেস64 এনকোড করে রাখতে হবে।
    
    // আপাতত লোকাল টেস্টিং এর জন্য এই কনফিগারেশন।
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath)
    });
    console.log("✅ Firebase Admin SDK initialized successfully.");
} catch (error) {
    if (!admin.apps.length) {
        console.error("❌ Firebase Admin SDK initialization failed:", error.message);
    }
}


// =======================================================
// 3. মিডলওয়্যার
// =======================================================
app.use(cors());
app.use(express.json());


// =======================================================
// 4. API রুট এবং ডামি রুট প্রতিস্থাপন
// =======================================================

// 💡 আপনার আসল auth রুট ব্যবহার করুন, ডামি রুটটি সরিয়ে ফেলুন
app.use('/api/auth', authRouter); 


// 💡 পুরানো ডামি /api/login রুটটি সরিয়ে ফেলা হয়েছে। 
// 💡 পুরানো ডামি /api/posts রুটটি রাখা হলো, যদি না এটি auth এর সাথে যুক্ত হয়।
app.get('/api/posts', (req, res) => {
    return res.status(200).json({ 
        posts: [
            { id: 1, user: 'naimus', text: 'Hello from the API!' },
            { id: 2, user: 'test_user', text: 'This is a test post.' }
        ]
    });
});


// =======================================================
// 5. স্ট্যাটিক এবং রুট হ্যান্ডলিং
// =======================================================

// আপনার রুট যদি front-end সার্ভ না করে, তবে নিচের দুটি লাইন বাদ দিন
// app.use(express.static(path.join(__dirname, "public")));
// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "public", "index.html"));
// });

app.get("/", (req, res) => {
    res.send('Onyxdrift Server is Live!');
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
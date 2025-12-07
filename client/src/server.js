// src/server.js (CORS সক্ষম করা হয়েছে)

import 'dotenv/config'; 
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors'; // 💡 CORS ইমপোর্ট করা হয়েছে

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 10000;

// 💡 CORS মিডলওয়্যার সক্ষম করা হয়েছে
// এটি আপনার ফ্রন্টএন্ড ডোমেইনকে আপনার API ডোমেইন অ্যাক্সেস করার অনুমতি দেবে।
app.use(cors()); 


// 💡 বডি পার্সার যোগ করা হয়েছে: ইনকামিং JSON ডেটা পার্স করার জন্য
app.use(express.json()); 

// =======================================================
// 🚨 গুরুত্বপূর্ণ: API রুটিং (অপরিবর্তিত)
// =======================================================

// ডামি লগইন রুট
app.post('/api/login', (req, res) => {
    // ফ্রন্টএন্ড থেকে আসা ডেটা
    const { email, password } = req.body; 

    console.log(`Login attempt: ${email} with password: ${password ? 'received' : 'not received'}`);

    if (email === "test@example.com" && password === "123456") {
        return res.status(200).json({ 
            success: true, 
            message: "Login successful (Dummy Test)",
            token: "fake_token_123" 
        });
    } else {
        return res.status(401).json({ 
            success: false, 
            message: "Invalid credentials or Database not connected." 
        });
    }
});


// ডামি পোস্ট রুট (অপরিবর্তিত)
app.get('/api/posts', (req, res) => {
    return res.status(200).json({ 
        posts: [
            { id: 1, user: 'naimus', text: 'Hello from the API!' },
            { id: 2, user: 'test_user', text: 'This is a test post.' }
        ]
    });
});


// =======================================================
// স্ট্যাটিক এবং রুট হ্যান্ডলিং (অপরিবর্তিত)
// =======================================================

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
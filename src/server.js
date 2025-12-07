// src/server.js (সংশোধিত কোড)

import 'dotenv/config'; 
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 10000; // Render-এর জন্য ডিফল্ট 10000 ব্যবহার করা ভালো

// 💡 বডি পার্সার যোগ করা হয়েছে: ইনকামিং JSON ডেটা পার্স করার জন্য
app.use(express.json()); 

// 💡 CORS যোগ করা যেতে পারে, যদিও এটি আপনার API সার্ভারে থাকা উচিত
// import cors from 'cors';
// app.use(cors()); 


// =======================================================
// 🚨 গুরুত্বপূর্ণ: API রুটিং যোগ করা হয়েছে
// =======================================================

// ডামি লগইন রুট
app.post('/api/login', (req, res) => {
    // ফ্রন্টএন্ড থেকে আসা ডেটা
    const { email, password } = req.body; 

    // 💡 ডাটাবেস এবং প্রকৃত লগইন লজিক এখানে যোগ করতে হবে।
    // আপাতত, আমরা দেখব সার্ভার ডেটা পাচ্ছে কি না:
    console.log(`Login attempt: ${email} with password: ${password ? 'received' : 'not received'}`);

    // যদি প্রকৃত MongoDB সংযোগ এবং ইউজার যাচাইকরণ না থাকে, তবে একটি ডামি রেসপন্স দিন:
    if (email === "test@example.com" && password === "123456") {
        return res.status(200).json({ 
            success: true, 
            message: "Login successful (Dummy Test)",
            token: "fake_token_123" // টোকেন থাকলে সেটি দিন
        });
    } else {
        // যদি ডাটাবেস সংযোগ না থাকে, এই রেসপন্সটি আসবে
        return res.status(401).json({ 
            success: false, 
            message: "Invalid credentials or Database not connected." 
        });
    }
});


// ডামি পোস্ট রুট (পোস্ট ফিডের জন্য)
app.get('/api/posts', (req, res) => {
    return res.status(200).json({ 
        posts: [
            { id: 1, user: 'naimus', text: 'Hello from the API!' },
            { id: 2, user: 'test_user', text: 'This is a test post.' }
        ]
    });
});


// =======================================================
// স্ট্যাটিক এবং রুট হ্যান্ডলিং
// =======================================================

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
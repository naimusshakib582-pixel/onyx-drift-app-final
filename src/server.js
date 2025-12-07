// src/server.js

// 1. dotenv কে require() এর বদলে import 'dotenv/config' দিয়ে লোড করুন
import 'dotenv/config'; 

// 2. require() এর বদলে import ব্যবহার করে express এবং path লোড করুন
import express from 'express';
import path from 'path';

// 3. __dirname ভ্যারিয়েবলটি ES Module এ ডিফল্টভাবে থাকে না, তাই এটি সংজ্ঞায়িত করুন
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Render সার্ভার থেকে PORT ভেরিয়েবল নেয়, লোকাল এনভায়রনমেন্টের জন্য 5000 ডিফল্ট
const PORT = process.env.PORT || 5000; 

// আপনার স্ট্যাটিক ফাইল এবং রুট হ্যান্ডলিং ঠিক রাখা হলো
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
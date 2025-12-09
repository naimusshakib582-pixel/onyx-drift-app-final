const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 10000;

// আপনার সঠিক ব্যাকএন্ড URL
const TARGET_URL = 'https://onyx-drift-app-final.onrender.com';

// ফ্রন্টএন্ডের ডোমেইন এবং সঠিক ব্যাকএন্ড ডোমেইনকে CORS এর জন্য হোয়াইটলিস্ট করুন
const allowedOrigins = [
    'https://onyx-drift.com',
    'https://www.onyx-drift.com',
    TARGET_URL
];

// CORS কনফিগারেশন
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// প্রক্সি সেটআপ (সমস্ত /api রিকোয়েস্টকে সঠিক সার্ভারে ফরোয়ার্ড করবে)
const apiProxy = createProxyMiddleware('/api', {
    target: TARGET_URL,
    changeOrigin: true, // এটি হোস্ট হেডার পরিবর্তন করে যাতে টার্গেট সার্ভার জানতে পারে এটি তার ডোমেইনের জন্য
    pathRewrite: {
        '^/api': '/api' // রিকোয়েস্টের পাথ পরিবর্তন না করে সোজাসুজি ফরোয়ার্ড করবে
    },
    onProxyReq: (proxyReq, req, res) => {
        // রিকোয়েস্ট হেডার যদি পরিবর্তন করতে হয়
    }
});

// /api পাথে প্রক্সি ব্যবহার করুন
app.use('/api', apiProxy);

// রুট বা অন্য কোনো পাথের জন্য একটি সাধারণ প্রতিক্রিয়া
app.get('/', (req, res) => {
    res.send('Onyx Drift Proxy Server is running and routing to: ' + TARGET_URL);
});

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
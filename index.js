import express from "express";
import cors from "cors";

const app = express();

// 1. CORS Configuration:
// আপনার ফ্রন্টএন্ড (Netlify) ঠিকানা থেকে আসা অনুরোধগুলি অনুমোদিত করার জন্য।
// যদি আপনি ফ্রন্টএন্ড URL না জানেন, তবে আপাতত 'origin: true' সেট করুন।
// তবে, সুরক্ষার জন্য আপনার Netlify URL (https://onyx-drift-app-final.netlify.app) ব্যবহার করা উচিত।
app.use(cors({
    origin: true, // এটি সব অরিজিন (ডোমেইন) থেকে রিকোয়েস্ট গ্রহণ করবে (ডেভেলপমেন্টের জন্য সহজ)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // অনুমোদিত মেথড
    credentials: true, // কুকিজ, অথরাইজেশন হেডার পাস করার অনুমতি দেয়
}));

// 2. JSON middleware: Incoming request body পার্স করার জন্য।
app.use(express.json());

// --- রুট রাউট (সার্ভার হেলথ চেক) ---
// এটি নিশ্চিত করে যে সার্ভারটি চালু আছে কিনা।
app.get('/', (req, res) => {
    res.status(200).send("OnyxDrift Backend Server is Live and Operational!");
});

// --- API রাউট ---

// Example login route
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    // ⚠️ গুরুত্বপূর্ণ: এই লজিকটি একটি ডামি। লগইন ব্যর্থ হলে ফ্রন্টএন্ড কাজ করবে না।
    // আপনার আসল ইউজার ডেটা এবং অথেন্টিকেশন লজিক এখানে যুক্ত করতে হবে।
    if (email === "test@example.com" && password === "123456") {
        // ফ্রন্টএন্ডে ইউজার ডেটা পাঠানোর জন্য একটি ইউজার অবজেক্ট তৈরি করা হয়েছে
        const dummyUser = { 
            id: 'u123',
            name: 'Test User',
            email: email,
            avatar: 'https://placehold.co/40x40/007bff/ffffff?text=TU',
            token: 'dummy-jwt-token'
        };
        res.json({ success: true, message: "Login successful", user: dummyUser });
    } else {
        // লগইন ব্যর্থ হলে 401 Unauthorised স্ট্যাটাস পাঠানো হয়েছে
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});


// Render-এর পরিবেশ থেকে PORT ব্যবহার করুন, না পেলে 5000 ব্যবহার করুন।
const PORT = process.env.PORT || 5000; 

// Server listen
app.listen(PORT, () => console.log(`Server running on port ${PO
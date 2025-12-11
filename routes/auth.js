// routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as admin from 'firebase-admin'; // 💡 Firebase Admin SDK ইম্পোর্ট করুন
import User from '../models/User.js'; // .js extension must for ES modules

const router = express.Router();

// =======================================================
// 🟢 রেজিস্ট্রেশন রুট (Register user) - অপরিবর্তিত
// =======================================================
router.post('/register', async (req, res) => {
    // ... আপনার বর্তমান রেজিস্ট্রেশন কোড
    // (ইউজারনেম/পাসওয়ার্ড ব্যবহার করে রেজিস্ট্রেশন)
    // ...
});

// =======================================================
// 🔑 লগইন রুট (Login user) - অপরিবর্তিত
// =======================================================
router.post('/login', async (req, res) => {
    // ... আপনার বর্তমান লগইন কোড
    // (ইউজারনেম/পাসওয়ার্ড ব্যবহার করে লগইন)
    // ...
});


// =======================================================
// 🚀 Firebase Auth Login রুট (Social Login এর জন্য)
// =======================================================
router.post('/firebase-login', async (req, res) => {
    // 1. ফ্রন্টএন্ড থেকে ID টোকেন গ্রহণ
    const { idToken } = req.body;
    
    if (!idToken) {
        return res.status(400).json({ msg: "Firebase ID Token is missing." });
    }

    try {
        // 2. Firebase Admin SDK ব্যবহার করে টোকেন যাচাই করা
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid: firebaseUid, email, name } = decodedToken;
        
        if (!email) {
             return res.status(400).json({ msg: "Email not provided by social provider." });
        }

        // 3. MongoDB তে ইউজারটি খোঁজা বা নতুন ইউজার তৈরি করা
        let user = await User.findOne({ email }); 

        if (!user) {
             // নতুন ইউজার: ডেটাবেসে সেভ করুন
             user = new User({ 
                 email, 
                 name: name || 'Social User',
                 // Note: Firebase Uid সেভ করা হলো
                 firebaseUid: firebaseUid,
                 isSocialUser: true // নতুন ফিল্ড যা মডেলে যোগ করতে হবে
             });
             await user.save();
        }

        // 4. আপনার নিজের অ্যাপ্লিকেশন JWT তৈরি করা
        const payload = { user: { id: user._id } };
        const appToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        // 5. ফ্রন্টএন্ডে আপনার অ্যাপ্লিকেশন টোকেনটি পাঠানো
        res.json({ 
            token: appToken,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email,
                avatar: user.avatar || null,
            }
        });
        
    } catch (error) {
        console.error("Firebase Auth Error:", error.message);
        res.status(401).send("Authentication failed. Invalid token.");
    }
});


export default router;
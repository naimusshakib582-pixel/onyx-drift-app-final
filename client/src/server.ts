// src/server.ts
import express from 'express';
import passport from 'passport';
import { configurePassport } from './config/passport';
import cors from 'cors'; // যদি ফ্রন্টএন্ড ভিন্ন পোর্টে থাকে

const app = express();
const PORT = 5000;

// মিডলওয়্যার সেটআপ
app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // ফ্রন্টএন্ডের জন্য
app.use(express.json());

// Passport কনফিগারেশন লোড
configurePassport(app);

// --- Passport Auth Routes ---

// ১. লগইন শুরু করার রুট (ব্যবহারকারী এখানে ক্লিক করবে)
app.get('/auth/google',
  passport.authenticate('google', { 
      scope: ['profile', 'email'] 
  })
);

// ২. Google থেকে ডেটা নিয়ে ফেরত আসার রুট (Callback URL)
app.get('/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:3000/login' // ব্যর্থ হলে এখানে যাবে
  }),
  (req, res) => {
    // সফল লগইন: ফ্রন্টএন্ডের ড্যাশবোর্ডে রিডাইরেক্ট করুন
    res.redirect('http://localhost:3000/dashboard'); 
  }
);

// ৩. লগআউট রুট
app.get('/auth/logout', (req, res, next) => {
    // Passport লগআউট পদ্ধতি
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('http://localhost:3000/login'); // লগআউটের পর লগইন পেজে পাঠান
    });
});

// ৪. সুরক্ষিত রুট এবং ইউজার স্ট্যাটাস চেক
app.get('/api/current_user', (req, res) => {
    // Passport নিশ্চিত করে যে req.isAuthenticated() ফাংশনটি কাজ করছে
    if (req.isAuthenticated()) {
        res.send(req.user); // বর্তমানে লগইন করা ইউজারের তথ্য
    } else {
        res.status(401).send({ message: "Not Authenticated" });
    }
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
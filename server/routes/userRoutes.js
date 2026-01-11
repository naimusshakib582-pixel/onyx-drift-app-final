import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import Post from '../models/Post.js'; 
import User from '../models/User.js';
import { createPost } from '../controllers/postController.js';

const router = express.Router();

/* ==========================================================
    ⚙️ MULTER CONFIGURATION
========================================================== */
const storage = multer.diskStorage({});
const upload = multer({ 
  storage, 
  limits: { fileSize: 50 * 1024 * 1024 } 
});

/* ==========================================================
    🚀 ROUTES
========================================================== */

/**
 * ১. ড্রিপ্টার সার্চ ফাংশনালিটি
 * Endpoint: GET /api/user/search
 * পরিবর্তন: খালি কুয়েরি হ্যান্ডেল করা হয়েছে যাতে ৪-৪ এরর না আসে।
 */
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    // কুয়েরি না থাকলে খালি অ্যারে পাঠানো হচ্ছে যাতে ফ্রন্টএন্ড এরর না দেখায়
    if (!query || query.trim() === "") {
      return res.status(200).json([]);
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { auth0Id: query }
      ]
    }).limit(12).lean();
    
    res.status(200).json(users);
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ message: "Search Error" });
  }
});

/**
 * ২. নতুন পোস্ট তৈরি
 */
router.post('/create', auth, upload.single('file'), createPost);

/**
 * ৩. প্রোফাইল এবং পোস্ট একসাথে পাওয়া (Neural Discovery Link)
 * Endpoint: GET /api/user/:userId
 * সমাধান: স্পেশাল ক্যারেক্টার এবং Route Conflict হ্যান্ডেল করা হয়েছে।
 */
router.get('/:userId', async (req, res) => {
  try {
    const rawUserId = req.params.userId;

    // যদি ভুলে 'search' শব্দটি userId হিসেবে আসে তবে এটি স্কিপ করবে
    if (rawUserId === 'search') return;

    // URL এনকোডেড আইডি (যেমন pipe '|') ডিকোড করা
    const targetId = decodeURIComponent(rawUserId);
    console.log(`📡 Neural Sync Request for ID: ${targetId}`);

    // ১. ডাটাবেস থেকে ইউজার খোঁজা
    const user = await User.findOne({ auth0Id: targetId }).lean();

    // ২. ওই ইউজারের সব পোস্ট খোঁজা
    const posts = await Post.find({ 
      $or: [
        { authorAuth0Id: targetId },
        { authorId: targetId },
        { user: targetId },
        { author: targetId }
      ]
    })
    .sort({ createdAt: -1 })
    .lean();

    // যদি ইউজার ডাটাবেসে না থাকে, তবুও ৪-৪ না পাঠিয়ে ডিফল্ট ডাটা পাঠানো হচ্ছে
    if (!user) {
      return res.status(200).json({
        user: { auth0Id: targetId, name: "Unknown Drifter", avatar: "" },
        posts: posts || []
      });
    }

    res.status(200).json({
      user: user,
      posts: posts || []
    });

  } catch (err) {
    console.error("❌ Neural Fetch Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Neural Link Error." 
    });
  }
});

export default router;
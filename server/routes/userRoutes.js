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
 * ১. ড্রিপ্টার সার্চ ফাংশনালিটি (উপরে রাখা হয়েছে কনফ্লিক্ট এড়াতে)
 * Endpoint: GET /api/user/search
 */
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { auth0Id: query }
      ]
    }).limit(12).lean();
    
    res.json(users);
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ message: "Search Error" });
  }
});

/**
 * ২. নতুন পোস্ট তৈরি
 * Endpoint: POST /api/user/create
 */
router.post('/create', auth, upload.single('file'), createPost);

/**
 * ৩. প্রোফাইল এবং পোস্ট একসাথে পাওয়া (Neural Discovery Link)
 * Endpoint: GET /api/user/:userId
 */
router.get('/:userId', auth, async (req, res) => {
  try {
    // স্পেশাল ক্যারেক্টার (যেমন '|') হ্যান্ডেল করার জন্য ডিকোড
    const targetId = decodeURIComponent(req.params.userId);
    console.log(`📡 Neural Sync Request for: ${targetId}`);

    // ১. ডাটাবেস থেকে ইউজার খুঁজে বের করা
    const user = await User.findOne({ auth0Id: targetId }).lean();

    // ২. ওই ইউজারের সব পোস্ট খুঁজে বের করা (সব সম্ভাব্য ফিল্ড চেক করা হচ্ছে)
    const posts = await Post.find({ 
      $or: [
        { authorAuth0Id: targetId },
        { authorId: targetId },
        { author: targetId },
        { user: targetId } 
      ]
    })
    .sort({ createdAt: -1 })
    .lean();

    // ৩. অবজেক্ট আকারে ডাটা রেসপন্স
    res.json({
      user: user || { auth0Id: targetId, name: "Unknown Drifter", avatar: "" },
      posts: posts || []
    });

    console.log(`✅ Success: Found ${posts.length} signals for ${targetId}`);
  } catch (err) {
    console.error("❌ Neural Fetch Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Neural Link Error: Could not synchronize signals." 
    });
  }
});

export default router;
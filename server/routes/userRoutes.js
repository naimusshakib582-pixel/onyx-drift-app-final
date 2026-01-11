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
 */
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
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
 * ৩. প্রোফাইল রাউট (আপনার এরর দূর করার জন্য)
 * Endpoint: GET /api/user/profile/:userId
 */
router.get('/profile/:userId', async (req, res) => {
  try {
    const targetId = decodeURIComponent(req.params.userId);
    console.log(`📡 Neural Sync (Profile) for ID: ${targetId}`);

    const user = await User.findOne({ auth0Id: targetId }).lean();
    const posts = await Post.find({ 
      $or: [{ authorAuth0Id: targetId }, { user: targetId }, { author: targetId }]
    }).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      user: user || { auth0Id: targetId, name: "Unknown Drifter", avatar: "" },
      posts: posts || []
    });
  } catch (err) {
    res.status(500).json({ message: "Neural Link Error" });
  }
});

/**
 * ৪. জেনারেল ডায়নামিক রাউট
 * Endpoint: GET /api/user/:userId
 * এটি সবার নিচে থাকবে যাতে অন্য রাউটের সাথে কনফ্লিক্ট না হয়।
 */
router.get('/:userId', async (req, res) => {
  try {
    const rawUserId = req.params.userId;
    if (rawUserId === 'search' || rawUserId === 'profile') return;

    const targetId = decodeURIComponent(rawUserId);
    console.log(`📡 Neural Sync (Direct) for ID: ${targetId}`);

    const user = await User.findOne({ auth0Id: targetId }).lean();
    const posts = await Post.find({ 
      $or: [{ authorAuth0Id: targetId }, { user: targetId }, { author: targetId }]
    }).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      user: user || { auth0Id: targetId, name: "Unknown Drifter", avatar: "" },
      posts: posts || []
    });
  } catch (err) {
    res.status(500).json({ message: "Neural Link Error" });
  }
});

export default router;
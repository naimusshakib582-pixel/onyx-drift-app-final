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
 * ১. ড্রিপ্টার সার্চ (Search Fix)
 * এটি সবার উপরে রাখা হয়েছে যাতে ডায়নামিক রাউটের সাথে কনফ্লিক্ট না হয়।
 */
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === "") return res.json([]);

    const currentUserId = req.user.sub || req.user.id;
    const searchRegex = new RegExp(`${query.trim()}`, "i");

    const users = await User.find({
      auth0Id: { $ne: currentUserId },
      $or: [
        { name: { $regex: searchRegex } },
        { nickname: { $regex: searchRegex } },
        { auth0Id: query }
      ]
    }).limit(12).lean();
    
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Search signal lost" });
  }
});

/**
 * ২. প্রোফাইল আপডেট (Update Fix)
 */
router.put("/update-profile", auth, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { nickname, name, bio, location, workplace } = req.body;
    const targetAuth0Id = req.user.sub || req.user.id;
    let updateFields = { name, nickname, bio, location, workplace };

    if (req.files) {
      if (req.files.avatar) updateFields.avatar = req.files.avatar[0].path;
      if (req.files.cover) updateFields.coverImg = req.files.cover[0].path;
    }

    const updatedUser = await User.findOneAndUpdate(
      { auth0Id: targetAuth0Id }, 
      { $set: updateFields },
      { new: true, upsert: true, lean: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ msg: 'Identity Sync Failed' });
  }
});

/**
 * ৩. প্রোফাইল এবং পোস্ট একসাথে পাওয়া (Fixes 404 & %7C Error)
 * এই রাউটটি আপনার কনসোলের '/api/user/profile/...' এররটি সমাধান করবে।
 */
router.get(['/profile/:userId', '/:userId'], auth, async (req, res) => {
  try {
    const rawUserId = req.params.userId;
    if (rawUserId === 'search' || rawUserId === 'all') return;

    const targetId = decodeURIComponent(rawUserId);
    console.log(`📡 Neural Sync Request for ID: ${targetId}`);

    const user = await User.findOne({ auth0Id: targetId }).lean();
    const posts = await Post.find({ 
      $or: [
        { authorAuth0Id: targetId },
        { authorId: targetId },
        { user: targetId },
        { author: targetId }
      ]
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
 * ৪. নতুন পোস্ট তৈরি
 */
router.post('/create', auth, upload.single('file'), createPost);

/**
 * ৫. ফলো সিস্টেম
 */
router.post("/follow/:targetId", auth, async (req, res) => {
  try {
    const myId = req.user.sub || req.user.id;
    const targetId = decodeURIComponent(req.params.targetId);
    if (myId === targetId) return res.status(400).json({ msg: "Self-link forbidden" });

    const user = await User.findOne({ auth0Id: myId });
    const isFollowing = user.following?.includes(targetId);

    if (isFollowing) {
      await Promise.all([
        User.updateOne({ auth0Id: myId }, { $pull: { following: targetId } }),
        User.updateOne({ auth0Id: targetId }, { $pull: { followers: myId } })
      ]);
      res.json({ followed: false });
    } else {
      await Promise.all([
        User.updateOne({ auth0Id: myId }, { $addToSet: { following: targetId } }),
        User.updateOne({ auth0Id: targetId }, { $addToSet: { followers: myId } })
      ]);
      res.json({ followed: true });
    }
  } catch (err) {
    res.status(500).json({ msg: "Connection failed" });
  }
});

export default router;
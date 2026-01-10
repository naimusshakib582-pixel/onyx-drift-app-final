import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Post from '../models/Post.js'; // পোস্ট খোঁজার জন্য প্রয়োজন
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// --- ১. Cloudinary কনফিগারেশন ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'onyx_drift_profiles',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });

/* ==========================================================
    🚀 ROUTES
========================================================== */

// --- ২. ইউজার সার্চ এবং ডিসকভারি রাউট ---
// Endpoint: GET /api/user/search
router.get('/search', auth, async (req, res) => {
  try {
    const { query, page = 1, limit = 12 } = req.query; 
    const currentUserId = req.user.id;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let users;

    if (!query || query.trim() === "") {
      users = await User.find({ auth0Id: { $ne: currentUserId } })
        .select('name avatar auth0Id isVerified bio followers nickname')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(); 
    } else {
      const searchRegex = new RegExp(`^${query.trim()}`, 'i'); 
      users = await User.find({
        auth0Id: { $ne: currentUserId },
        $or: [
          { name: { $regex: searchRegex } },
          { nickname: { $regex: searchRegex } }
        ]
      })
      .select('name avatar auth0Id isVerified bio followers nickname')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    }
    res.json(users);
  } catch (err) {
    console.error("❌ Search Error:", err.message);
    res.status(500).json({ msg: 'Neural Grid Search Failed' });
  }
});

// --- ৩. প্রোফাইল এবং পোস্ট একসাথে পাওয়া (Neural Sync) ---
/**
 * 💡 গুরুত্বপূর্ণ: এই রাউটটি ডাইনামিক (/:userId), 
 * তাই এটি সার্চ রাউটের নিচে রাখতে হবে যাতে /search কল করলে এরর না আসে।
 * Endpoint: GET /api/user/:userId
 */
router.get('/:userId', auth, async (req, res) => {
  try {
    const targetId = decodeURIComponent(req.params.userId);
    console.log(`📡 Neural Sync Request for ID: ${targetId}`);

    // ১. ইউজার ডাটা খোঁজা
    const user = await User.findOne({ auth0Id: targetId }).lean();

    // ২. ওই ইউজারের করা পোস্টগুলো খোঁজা
    const posts = await Post.find({ 
      $or: [
        { authorAuth0Id: targetId },
        { user: targetId } 
      ]
    })
    .sort({ createdAt: -1 })
    .lean();

    res.json({
      user: user || { auth0Id: targetId, name: "Unknown Drifter", avatar: "" },
      posts: posts || []
    });

  } catch (err) {
    console.error("❌ Profile Fetch Error:", err);
    res.status(500).json({ msg: "Synchronization failed" });
  }
});

// --- ৪. ফলো/আনফলো সিস্টেম ---
router.post('/follow/:targetId', auth, async (req, res) => {
  try {
    const myId = req.user.id; 
    const targetId = decodeURIComponent(req.params.targetId); 

    if (myId === targetId) {
      return res.status(400).json({ msg: "Neural link with self is impossible" });
    }

    const targetUser = await User.findOne({ auth0Id: targetId }).select('followers').lean();
    if (!targetUser) return res.status(404).json({ msg: "Identity not found" });

    const isFollowing = targetUser.followers.includes(myId);

    if (isFollowing) {
      await Promise.all([
        User.updateOne({ auth0Id: myId }, { $pull: { following: targetId } }),
        User.updateOne({ auth0Id: targetId }, { $pull: { followers: myId } })
      ]);
      return res.json({ msg: "Unfollowed", followed: false });
    } else {
      await Promise.all([
        User.updateOne({ auth0Id: myId }, { $addToSet: { following: targetId } }),
        User.updateOne({ auth0Id: targetId }, { $addToSet: { followers: myId } })
      ]);
      return res.json({ msg: "Followed", followed: true });
    }
  } catch (err) {
    res.status(500).json({ error: "Link synchronization failed" });
  }
});

// --- ৫. প্রোফাইল আপডেট ---
router.put("/update-profile", auth, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, nickname, bio, location, workplace } = req.body;
    let updateFields = { 
      name, 
      nickname: nickname || name?.toLowerCase().replace(/\s/g, ''), 
      bio, 
      location, 
      workplace 
    };

    if (req.files?.avatar) updateFields.avatar = req.files.avatar[0].path;
    if (req.files?.cover) updateFields.coverImg = req.files.cover[0].path;

    const updatedUser = await User.findOneAndUpdate(
      { auth0Id: req.user.id },
      { $set: updateFields },
      { new: true, lean: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ msg: 'Update Failed' });
  }
});

export default router;
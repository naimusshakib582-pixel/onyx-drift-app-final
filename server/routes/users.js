import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'onyx_drift_profiles',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});
const upload = multer({ storage });

/* ==========================================================
    🌍 ১. GET ALL USERS
========================================================== */
router.get('/all', auth, async (req, res) => {
  try {
    const myId = req.user.sub || req.user.id;
    const users = await User.find({ auth0Id: { $ne: myId } })
      .select('name avatar auth0Id isVerified bio followers nickname')
      .sort({ createdAt: -1 }).limit(20).lean();
    res.json(users);
  } catch (err) { res.status(500).json({ msg: 'Fetch Failed' }); }
});

/* ==========================================================
    🔍 ২. SEARCH
========================================================== */
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    const myId = req.user.sub || req.user.id;
    let filter = { auth0Id: { $ne: myId } };
    if (query) {
      const searchRegex = new RegExp(`${query.trim()}`, 'i'); 
      filter.$or = [{ name: { $regex: searchRegex } }, { nickname: { $regex: searchRegex } }];
    }
    const users = await User.find(filter).limit(12).lean();
    res.json(users);
  } catch (err) { res.status(500).json({ msg: 'Search Failed' }); }
});

/* ==========================================================
    📡 ৩. প্রোফাইল ডাটা ফেচিং (The Ultimate Fix)
========================================================== */

// কমন লজিক ফাংশন
const getProfileData = async (req, res) => {
  try {
    const targetId = decodeURIComponent(req.params.userId);
    
    // রিজার্ভড শব্দগুলো বাদ দেওয়া যাতে অন্য রাউট ডিস্টার্ব না হয়
    if (["all", "search", "update-profile"].includes(targetId)) return;

    const user = await User.findOne({ auth0Id: targetId }).lean();
    
    if (!user) {
        return res.status(404).json({ msg: "User not found in orbit" });
    }

    const posts = await Post.find({ 
      $or: [{ authorAuth0Id: targetId }, { user: targetId }] 
    }).sort({ createdAt: -1 }).lean();

    res.json({ user, posts: posts || [] });
  } catch (err) { 
    console.error("Profile Fetch Error:", err);
    res.status(500).json({ msg: "Neural Link Failed" }); 
  }
};

// সমাধান: যদি ফ্রন্টএন্ড /profile/ID কল করে
router.get('/profile/:userId', auth, getProfileData);

// সমাধান: যদি ফ্রন্টএন্ড সরাসরি /ID কল করে (যা আপনার কনসোলে দেখা যাচ্ছে)
router.get('/:userId', auth, getProfileData);

/* ==========================================================
    🤝 ৪. ফলো/আনফলো সিস্টেম
========================================================== */
router.post('/follow/:targetId', auth, async (req, res) => {
  try {
    const myId = req.user.sub || req.user.id;
    const targetId = decodeURIComponent(req.params.targetId);
    if (myId === targetId) return res.status(400).json({ msg: "Self link impossible" });

    const targetUser = await User.findOne({ auth0Id: targetId });
    if (!targetUser) return res.status(404).json({ msg: "User not found" });

    const isFollowing = targetUser.followers.includes(myId);

    if (isFollowing) {
      await Promise.all([
        User.updateOne({ auth0Id: myId }, { $pull: { following: targetId } }),
        User.updateOne({ auth0Id: targetId }, { $pull: { followers: myId } })
      ]);
    } else {
      await Promise.all([
        User.updateOne({ auth0Id: myId }, { $addToSet: { following: targetId } }),
        User.updateOne({ auth0Id: targetId }, { $addToSet: { followers: myId } })
      ]);
    }
    res.json({ followed: !isFollowing });
  } catch (err) { res.status(500).json({ msg: "Link failed" }); }
});

/* ==========================================================
    📝 ৫. প্রোফাইল আপডেট
========================================================== */
router.put("/update-profile", auth, upload.fields([
  { name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { bio, location, workplace } = req.body;
    const myId = req.user.sub || req.user.id;
    let updateFields = { bio, location, workplace };

    if (req.files?.avatar) updateFields.avatar = req.files.avatar[0].path;
    if (req.files?.cover) updateFields.coverImg = req.files.cover[0].path;

    Object.keys(updateFields).forEach(key => 
      (updateFields[key] === undefined || updateFields[key] === "") && delete updateFields[key]
    );

    const updatedUser = await User.findOneAndUpdate(
      { auth0Id: myId },
      { $set: updateFields },
      { new: true, lean: true }
    );
    res.json(updatedUser);
  } catch (err) { res.status(500).json({ msg: 'Update Failed' }); }
});

export default router;
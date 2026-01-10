import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
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

// --- ২. ইউজার সার্চ এবং ডিসকভারি রাউট ---
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    let users;

    // যদি সার্চ কোয়েরি না থাকে, ডিফল্ট ডিসকভারি মোড (অন্যান্য ইউজারদের সাজেস্ট করবে)
    if (!query || query.trim() === "") {
      users = await User.find({ auth0Id: { $ne: req.user.id } })
        .select('name avatar auth0Id isVerified bio followers following nickname')
        .limit(12);
    } else {
      // Regex সার্চ (নাম, ইমেইল বা আইডি দিয়ে)
      const searchRegex = new RegExp(query, 'i');
      users = await User.find({
        $and: [
          { auth0Id: { $ne: req.user.id } },
          {
            $or: [
              { name: searchRegex },
              { nickname: searchRegex },
              { email: searchRegex },
              { auth0Id: searchRegex }
            ]
          }
        ]
      }).select('name avatar auth0Id isVerified bio followers following nickname').limit(15);
    }

    res.json(users);
  } catch (err) {
    console.error("❌ Search Error:", err);
    res.status(500).json({ msg: 'Search failed' });
  }
});

// --- ৩. ফলো/আনফলো সিস্টেম (Fixed for Auth0 ID) ---
router.post('/follow/:targetId', auth, async (req, res) => {
  try {
    const myId = req.user.id; 
    // পাইপ (|) ক্যারেক্টার হ্যান্ডেল করার জন্য ডিকোড করা হয়েছে
    const targetId = decodeURIComponent(req.params.targetId); 

    if (myId === targetId) {
      return res.status(400).json({ msg: "Cannot follow yourself" });
    }

    const targetUser = await User.findOne({ auth0Id: targetId });
    if (!targetUser) {
      return res.status(404).json({ msg: "Target user not found" });
    }

    // অলরেডি ফলো করা আছে কি না চেক
    const isFollowing = targetUser.followers.includes(myId);

    if (isFollowing) {
      // আনফলো লজিক
      await Promise.all([
        User.findOneAndUpdate({ auth0Id: myId }, { $pull: { following: targetId } }),
        User.findOneAndUpdate({ auth0Id: targetId }, { $pull: { followers: myId } })
      ]);
      return res.json({ msg: "Unfollowed", followed: false });
    } else {
      // ফলো লজিক
      await Promise.all([
        User.findOneAndUpdate({ auth0Id: myId }, { $addToSet: { following: targetId } }),
        User.findOneAndUpdate({ auth0Id: targetId }, { $addToSet: { followers: myId } })
      ]);
      return res.json({ msg: "Followed", followed: true });
    }
  } catch (err) {
    console.error("❌ Follow Action Error:", err);
    res.status(500).json({ error: "Action failed" });
  }
});

// --- ৪. প্রোফাইল ম্যানেজমেন্ট ---
router.get('/profile/:id', auth, async (req, res) => {
  try {
    // এখানেও ID ডিকোড করা হয়েছে
    const userId = decodeURIComponent(req.params.id);
    const user = await User.findOne({ auth0Id: userId }).select('-password');
    
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.put("/update-profile", auth, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, nickname, bio, location, workplace, email } = req.body;
    const finalName = name || nickname;

    if (!finalName) return res.status(400).json({ msg: 'Name is required' });

    let updateFields = { 
      name: finalName, 
      bio: bio || "", 
      location: location || "", 
      workplace: workplace || "" 
    };

    if (email) updateFields.email = email;
    if (req.files?.avatar) updateFields.avatar = req.files.avatar[0].path;
    if (req.files?.cover) updateFields.coverImg = req.files.cover[0].path;

    const updatedUser = await User.findOneAndUpdate(
      { auth0Id: req.user.id },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ msg: 'Update Failed', error: err.message });
  }
});

// --- ৫. ফ্রেন্ড সিস্টেম (Legacy) ---
router.post('/friend-request/:targetUserId', auth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const targetUserId = decodeURIComponent(req.params.targetUserId);
    
    if (senderId === targetUserId) return res.status(400).json({ msg: "Invalid action" });

    await User.findOneAndUpdate(
      { auth0Id: targetUserId },
      { $addToSet: { friendRequests: senderId } }
    );
    res.json({ msg: "Request sent!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
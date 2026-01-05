import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// Cloudinary কনফিগারেশন
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// প্রোফাইল ফটোর জন্য স্টোরেজ
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'onyx_drift_profiles',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });

// ১. প্রোফাইল গেট করা
router.get('/profile/:id', auth, async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.params.id });
    if (!user) return res.status(404).json({ msg: 'Identity not found' });
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// ২. সকল ইউজারের লিস্ট
router.get('/all', auth, async (req, res) => {
  try {
    const users = await User.find().select('name avatar auth0Id isVerified');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch users' });
  }
});

// ৩. প্রোফাইল আপডেট (FIX: Validation Error Resolved)
router.put("/update-profile", auth, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, nickname, bio, location, workplace, email } = req.body;
    
    // ভ্যালিডেশন এরর ফিক্স: name অথবা nickname যেটা পাওয়া যাবে সেটাই ইউজ হবে
    const finalName = name || nickname;
    if (!finalName) {
        return res.status(400).json({ msg: 'Name or Nickname is required' });
    }

    let updateFields = { 
      name: finalName, 
      bio: bio || "", 
      location: location || "", 
      workplace: workplace || "" 
    };

    if (email) updateFields.email = email;

    if (req.files) {
      if (req.files.avatar) updateFields.avatar = req.files.avatar[0].path;
      if (req.files.cover) updateFields.coverImg = req.files.cover[0].path;
    }

    const updatedUser = await User.findOneAndUpdate(
      { auth0Id: req.user.id },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(updatedUser);
  } catch (err) {
    console.error("Update Error:", err);
    if (err.code === 11000) return res.status(400).json({ msg: 'Email already exists' });
    res.status(500).json({ msg: 'Update Failed', error: err.message });
  }
});

// --- FRIEND SYSTEM (Super Fast Atomic Updates) ---

// ৪. ফ্রেন্ড রিকোয়েস্ট পাঠানো
router.post('/friend-request/:targetUserId', auth, async (req, res) => {
    try {
        const senderId = req.user.id;
        const { targetUserId } = req.params;

        if (senderId === targetUserId) return res.status(400).json({ msg: "Cannot add yourself" });

        // $addToSet ব্যবহার করা হয়েছে যাতে ডুপ্লিকেট রিকোয়েস্ট না যায় (O(1) Speed)
        await User.findOneAndUpdate(
            { auth0Id: targetUserId },
            { $addToSet: { friendRequests: senderId } }
        );

        res.json({ msg: "Friend request sent!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ৫. ফ্রেন্ড রিকোয়েস্ট এক্সেপ্ট করা
router.post('/friend-accept/:senderId', auth, async (req, res) => {
    try {
        const receiverId = req.user.id;
        const senderId = req.params.senderId;

        // দুজনকেই একসাথে আপডেট করা (Parallel Execution)
        const updateReceiver = User.findOneAndUpdate(
            { auth0Id: receiverId },
            { 
                $pull: { friendRequests: senderId },
                $addToSet: { friends: senderId }
            },
            { new: true }
        );

        const updateSender = User.findOneAndUpdate(
            { auth0Id: senderId },
            { $addToSet: { friends: receiverId } }
        );

        await Promise.all([updateReceiver, updateSender]);

        res.json({ msg: "You are now friends!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
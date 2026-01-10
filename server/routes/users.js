import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'onyx_drift_profiles',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});
const upload = multer({ storage });

// 🔍 ১. সার্চ ও ডিসকভারি (Pagination সহ)
router.get('/search', auth, async (req, res) => {
  try {
    const { query, page = 1, limit = 12 } = req.query; 
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let filter = { auth0Id: { $ne: req.user.id } };
    if (query) {
      const searchRegex = new RegExp(`^${query.trim()}`, 'i'); 
      filter.$or = [{ name: { $regex: searchRegex } }, { nickname: { $regex: searchRegex } }];
    }

    const users = await User.find(filter)
      .select('name avatar auth0Id isVerified bio followers nickname')
      .skip(skip).limit(parseInt(limit)).lean();
    
    res.json(users);
  } catch (err) { res.status(500).json({ msg: 'Search Failed' }); }
});

// 📡 ২. প্রোফাইল ডাটা ফেচিং (Neural Sync - Fix 404)
router.get('/:userId', auth, async (req, res) => {
  try {
    const targetId = decodeURIComponent(req.params.userId);
    const user = await User.findOne({ auth0Id: targetId }).lean();
    
    const posts = await Post.find({ 
      $or: [{ authorAuth0Id: targetId }, { user: targetId }] 
    }).sort({ createdAt: -1 }).lean();

    res.json({
      user: user || { auth0Id: targetId, name: "Unknown Drifter", avatar: "" },
      posts: posts || []
    });
  } catch (err) { res.status(500).json({ msg: "Neural Link Failed" }); }
});

// 🤝 ৩. ফলো/আনফলো সিস্টেম
router.post('/follow/:targetId', auth, async (req, res) => {
  try {
    const myId = req.user.id;
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

// 📝 ৪. প্রোফাইল আপডেট (নাম ও আইডি লক করা হয়েছে)
router.put("/update-profile", auth, upload.fields([
  { name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    // এখানে 'name' ইনপুট নেওয়া হচ্ছে না, তাই এটি ডাটাবেসে পরিবর্তন হবে না
    const { bio, location, workplace } = req.body;
    let updateFields = { bio, location, workplace };

    if (req.files?.avatar) updateFields.avatar = req.files.avatar[0].path;
    if (req.files?.cover) updateFields.coverImg = req.files.cover[0].path;

    const updatedUser = await User.findOneAndUpdate(
      { auth0Id: req.user.id },
      { $set: updateFields },
      { new: true, lean: true }
    );
    res.json(updatedUser);
  } catch (err) { res.status(500).json({ msg: 'Update Failed' }); }
});

export default router;
import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// ১. Cloudinary কনফিগারেশন (আপনার .env থেকে ডাটা নেবে)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ২. Multer Storage সেটআপ (ইমেজ ক্লাউডিনারিতে পাঠানোর জন্য)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'onyx_drift_profiles', // ক্লাউডিনারিতে এই ফোল্ডারে সেভ হবে
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // ইমেজ সাইজ অপ্টিমাইজেশান
  }
});

const upload = multer({ storage: storage });

// --- ৩. প্রোফাইল ডাটা গেট করা ---
router.get('/profile/:id', auth, async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.params.id });
    if (!user) {
      return res.status(404).json({ msg: 'Identity not found in neural database' });
    }
    res.json(user);
  } catch (err) {
    console.error('Fetch Error:', err.message);
    res.status(500).send('Server error');
  }
});

// --- ৪. প্রোফাইল আপডেট করা (ইমেজসহ) ---
router.put("/update-profile", auth, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { nickname, bio, location, workplace } = req.body;
    
    // সাধারণ ডাটা অবজেক্ট তৈরি
    let updateFields = { 
      name: nickname, 
      bio, 
      location, 
      workplace 
    };

    // যদি নতুন ইমেজ ফাইল থাকে, তবে তাদের Cloudinary লিঙ্কগুলো যোগ করা হবে
    if (req.files) {
      if (req.files.avatar) {
        updateFields.avatar = req.files.avatar[0].path;
      }
      if (req.files.cover) {
        updateFields.coverImg = req.files.cover[0].path;
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { auth0Id: req.user.id }, 
      { $set: updateFields },
      { new: true, upsert: true }
    );

    res.json(updatedUser);
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ msg: 'Update Failed', error: err.message });
  }
});

export default router;
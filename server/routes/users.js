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

// প্রোফাইল ফটোর জন্য স্টোরেজ কনফিগারেশন
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'onyx_drift_profiles',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });

// ১. প্রোফাইল গেট করা (Get Profile)
router.get('/profile/:id', auth, async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.params.id });
    if (!user) {
      return res.status(404).json({ msg: 'Identity not found in Drift network' });
    }
    res.json(user);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).send('Server error');
  }
});

// ২. সকল ইউজারের লিস্ট পাওয়া (৪-০-৪ এরর ফিক্স করার জন্য এটি যোগ করা হয়েছে)
router.get('/all', auth, async (req, res) => {
  try {
    const users = await User.find().select('name avatar auth0Id isVerified');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch users' });
  }
});

// ৩. প্রোফাইল আপডেট (ইমেজসহ)
router.put("/update-profile", auth, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cover', maxCount: 1 } // ফ্রন্টএন্ড থেকে 'cover' নামে ফাইল আসবে
]), async (req, res) => {
  try {
    const { nickname, bio, location, workplace, email } = req.body;
    
    // আপডেটের জন্য অবজেক্ট তৈরি
    let updateFields = { 
      name: nickname, 
      bio: bio || "", 
      location: location || "", 
      workplace: workplace || "" 
    };

    // যদি ইমেইল থাকে তবে সেটিও আপডেট হবে
    if (email) updateFields.email = email;

    // ফাইল আপলোড চেক
    if (req.files) {
      if (req.files.avatar) {
        updateFields.avatar = req.files.avatar[0].path;
      }
      if (req.files.cover) {
        updateFields.coverImg = req.files.cover[0].path; // মডেলের coverImg ফিল্ডে সেভ হবে
      }
    }

    // findOneAndUpdate ব্যবহার করা হয়েছে যাতে ইউজার না থাকলে তৈরি হয় (upsert)
    // এবং ডুপ্লিকেট ইমেইল এরর এড়াতে আমাদের মডেলে sparse: true করা আছে
    const updatedUser = await User.findOneAndUpdate(
      { auth0Id: req.user.id },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(updatedUser);
  } catch (err) {
    console.error("Update Error:", err);
    // যদি এখনো ডুপ্লিকেট এরর আসে
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Email already exists in the system' });
    }
    res.status(500).json({ msg: 'Update Failed', error: err.message });
  }
});

export default router;
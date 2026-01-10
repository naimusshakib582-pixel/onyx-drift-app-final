import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import Post from '../models/Post.js'; // ডাইনামিক ইম্পোর্টের চেয়ে সরাসরি ইম্পোর্ট ভালো

const router = express.Router();

const storage = multer.diskStorage({});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type!'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } 
});

// ১. নতুন পোস্ট তৈরি
import { createPost } from '../controllers/postController.js';
router.post('/create', auth, upload.single('file'), createPost);

// ২. নির্দিষ্ট ইউজারের সব পোস্ট পাওয়া (FIXED)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const targetId = decodeURIComponent(req.params.userId);
    
    // সমাধান: ডাটাবেসে 'authorAuth0Id' অথবা 'authorId' ফিল্ড দিয়ে খোঁজা হচ্ছে
    const posts = await Post.find({ 
      $or: [
        { authorAuth0Id: targetId },
        { authorId: targetId },
        { author: targetId }
      ]
    }).sort({ createdAt: -1 });

    console.log(`Neural Link: Found ${posts.length} signals for ${targetId}`);
    res.json(posts);
  } catch (err) {
    console.error("Neural Fetch Error:", err);
    res.status(500).send("Neural Link Error");
  }
});

export default router;
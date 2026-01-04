import express from 'express';
import auth from '../middleware/auth.js';
import Post from '../models/Post.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// ক্লাউডিনারি স্টোরেজ সেটআপ (ফটো এবং ভিডিওর জন্য)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'onyx_drift_posts',
    resource_type: "auto", 
    allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mov', 'webm']
  }
});

const upload = multer({ storage: storage });

// সব পোস্ট গেট করা
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// নির্দিষ্ট ইউজারের পোস্ট দেখা (প্রোফাইল পেজের জন্য)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId }).sort({ createdAt: -1 });
    res.json(posts || []);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// নতুন পোস্ট তৈরি (ফাইল আপলোডসহ)
// ফ্রন্টএন্ড থেকে ফাইলটি 'media' ফিল্ডে পাঠাতে হবে
router.post('/create', auth, upload.single('media'), async (req, res) => {
  try {
    const { text, mediaType, authorName, authorAvatar } = req.body;
    
    const newPost = new Post({
      text,
      media: req.file ? req.file.path : null, 
      mediaType: mediaType || (req.file ? (req.file.mimetype.includes('video') ? 'video' : 'image') : 'text'),
      authorName,
      authorAvatar,
      author: req.user.id,
      likes: [],
      comments: []
    });

    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error("Create Post Error:", err);
    res.status(500).json({ msg: 'Transmission Failed', error: err.message });
  }
});

export default router;
import express from 'express';
import auth from '../middleware/auth.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// --- ক্লাউডিনারি স্টোরেজ সেটআপ ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'onyx_drift_posts',
    resource_type: "auto", 
    allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mov', 'webm']
  }
});
const upload = multer({ storage: storage });

// ১. সব পোস্ট গেট করা (সুপার ফাস্ট ফেচিং)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(20); // লোড কমাতে লিমিট ব্যবহার করা হয়েছে
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ২. সুপার ফাস্ট লাইক/আনলাইক লজিক (Atomic Update)
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const userId = req.user.id;
    const isLiked = post.likes.includes(userId);

    // Atomic Operation: এক কোয়েরিতেই ডাটাবেস আপডেট হবে (O(1) Speed)
    const update = isLiked 
      ? { $pull: { likes: userId } }  // আনলাইক
      : { $addToSet: { likes: userId } }; // লাইক

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id, 
      update, 
      { new: true }
    );

    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ৩. ফ্রেন্ড রিকোয়েস্ট পাঠানো (Atomic Write)
router.post('/friend-request/:targetUserId', auth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { targetUserId } = req.params;

    if (senderId === targetUserId) return res.status(400).json({ msg: "Cannot add yourself" });

    // $addToSet ব্যবহার করলে ডুপ্লিকেট চেক করার দরকার পড়ে না, ডাটাবেস নিজ থেকেই হ্যান্ডেল করে
    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { friendRequests: senderId }
    });

    res.json({ msg: "Signal Sent Instantly!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ৪. ফ্রেন্ড রিকোয়েস্ট এক্সেপ্ট করা (Zero Lag Logic)
router.post('/friend-accept/:senderId', auth, async (req, res) => {
  try {
    const receiverId = req.user.id;
    const senderId = req.params.senderId;

    // ১. রিকোয়েস্ট রিমুভ এবং ফ্রেন্ড অ্যাড একসাথেই (Atomic)
    const receiverUpdate = User.findByIdAndUpdate(receiverId, {
      $pull: { friendRequests: senderId },
      $addToSet: { friends: senderId }
    });

    const senderUpdate = User.findByIdAndUpdate(senderId, {
      $addToSet: { friends: receiverId }
    });

    // দুটি অপারেশন একসাথে প্যারালালভাবে চলবে (Fastest)
    await Promise.all([receiverUpdate, senderUpdate]);

    res.json({ msg: "Connection Established!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ৫. পোস্ট তৈরি (Optimistic UI এর জন্য তৈরি)
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

    await newPost.save();
    res.status(201).json(newPost); // 201 status fast client-side handling এর জন্য
  } catch (err) {
    res.status(500).json({ msg: 'Transmission Failed' });
  }
});

// ৬. পোস্ট ডিলিট করা
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.author.toString() !== req.user.id) return res.status(401).json({ msg: "Unauthorized" });

    await post.deleteOne();
    res.json({ msg: "Post terminated", postId: req.params.id });
  } catch (err) {
    res.status(500).json({ msg: "Delete failed" });
  }
});

export default router;
// C:\Development\onyx-drift-app-final\client\src\routes\posts.js
import express from 'express';
// ✅ মিডলওয়্যার পাথ: দুই ধাপ উপরে (client) এসে AuthMiddleware/auth.js এ প্রবেশ
import { verifyAuth } from '../../AuthMiddleware/auth.js'; 
// ✅ মডেল পাথ: দুই ধাপ উপরে (client) এসে models/Post.js এ প্রবেশ
import Post from '../../data_models/post.js'; 

const router = express.Router();

router.post('/', verifyAuth, async (req, res) => {
    try {
        const { content, imageUrl } = req.body;
        const newPost = new Post({ user: req.user.id, content, imageUrl });
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(500).json({ message: "Failed to create post", error: error.message });
    }
});
// ----------------------------------------------------
// 2. সমস্ত পোস্ট দেখা (ফিড)
// GET /api/posts
// ----------------------------------------------------
router.get('/', async (req, res) => {
    try {
        // সমস্ত পোস্ট দেখানোর জন্য লজিক
        const posts = await Post.find()
            .populate('user', 'displayName profilePicture') 
            .sort({ createdAt: -1 }); 

        res.status(200).json(posts);
        
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch posts", error: error.message });
    }
});

// ----------------------------------------------------
// 3. একটি নির্দিষ্ট ব্যবহারকারীর সমস্ত পোস্ট দেখা
// GET /api/posts/user/:userId
// ----------------------------------------------------
router.get('/user/:userId', async (req, res) => {
    try {
        const posts = await Post.find({ user: req.params.userId })
            .populate('user', 'displayName profilePicture')
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
        
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user posts", error: error.message });
    }
});

export default router;
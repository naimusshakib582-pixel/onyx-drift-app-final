const express = require('express');
const router = express.Router();
const Post = require('../models/Post'); 
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// ১. সব পোস্ট গেট করা (Public)
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

/* ==========================================================
    ২. নির্দিষ্ট ইউজারের পোস্ট গেট করা
    এন্ডপয়েন্ট: GET /api/posts/user/:userId
========================================================== */
router.get('/user/:userId', authMiddleware, async (req, res) => {
    try {
        const targetId = decodeURIComponent(req.params.userId);
        
        const posts = await Post.find({ 
            $or: [
                { authorId: targetId },
                { authorAuth0Id: targetId }
            ] 
        }).sort({ createdAt: -1 });

        res.json(posts);
    } catch (err) {
        console.error("Neural Fetch Error:", err);
        res.status(500).json({ message: "Failed to fetch user signals" });
    }
});

// ৩. নতুন পোস্ট তৈরি করা
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { text, media, mediaType, authorName, authorAvatar, authorId } = req.body;
        const currentUserId = req.user.sub || req.user.id; 

        const newPost = new Post({ 
            text, 
            media, 
            mediaType, 
            authorName, 
            authorAvatar, 
            authorId: currentUserId,
            authorAuth0Id: currentUserId 
        });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        res.status(400).json({ message: "Post creation failed", error: err.message });
    }
});

// ৪. পোস্ট ডিলিট করা
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const currentUserId = req.user.sub || req.user.id;
        if (post.authorId !== currentUserId && post.authorAuth0Id !== currentUserId) {
            return res.status(401).json({ message: "Unauthorized!" });
        }
        
        await post.deleteOne();
        res.json({ message: "Post deleted successfully", postId: req.params.id });
    } catch (err) {
        res.status(500).json({ message: "Delete failed", error: err.message });
    }
});

// ৫. পোস্ট লাইক করা
router.put('/:id/like', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const userId = req.user.sub || req.user.id;
        if (post.likes.includes(userId)) {
            post.likes = post.likes.filter(id => id !== userId);
        } else {
            post.likes.push(userId);
        }
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ==========================================================
    নতুন অংশ: রিলস (Reels) ভিডিওর জন্য রুট
========================================================== */

// ৬. রিলস ভিডিও আপলোড করা
router.post('/reels', authMiddleware, async (req, res) => {
    try {
        const { text, mediaUrl, authorName, authorAvatar } = req.body;
        const currentUserId = req.user.sub || req.user.id;

        const newReel = new Post({
            text,
            media: mediaUrl,
            mediaType: 'video',
            postType: 'reels', // রিলস হিসেবে চিহ্নিত করতে
            authorName,
            authorAvatar,
            authorId: currentUserId,
            authorAuth0Id: currentUserId
        });

        const savedReel = await newReel.save();
        res.status(201).json(savedReel);
    } catch (err) {
        res.status(400).json({ message: "Reel transmission failed", error: err.message });
    }
});

// ৭. সব রিলস গেট করা
router.get('/reels/all', async (req, res) => {
    try {
        const reels = await Post.find({ postType: 'reels' }).sort({ createdAt: -1 });
        res.json(reels);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

module.exports = router;
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
    ২. নির্দিষ্ট ইউজারের পোস্ট গেট করা (এটিই আপনার মিসিং ছিল)
    এন্ডপয়েন্ট: GET /api/posts/user/:userId
========================================================== */
router.get('/user/:userId', authMiddleware, async (req, res) => {
    try {
        const targetId = decodeURIComponent(req.params.userId);
        
        // ডাটাবেসে authorId বা authorAuth0Id দিয়ে পোস্ট খোঁজা
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
        const currentUserId = req.user.sub || req.user.id; // Auth0 আইডি

        const newPost = new Post({ 
            text, 
            media, 
            mediaType, 
            authorName, 
            authorAvatar, 
            authorId: currentUserId,
            authorAuth0Id: currentUserId // ফ্রন্টএন্ড লিঙ্কের জন্য এটিও সেভ করুন
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

module.exports = router;
const express = require('express');
const router = express.Router();
const Post = require('../models/Post'); // আপনার Post Model এর পাথ
const { checkJwt } = require('../middleware/authMiddleware'); // Auth0 Middleware

// ১. সব পোস্ট গেট করা (Public)
router.get('/', async (req, res) => {
    try {
        // নতুন পোস্টগুলো আগে দেখানোর জন্য sort করা হয়েছে
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// ২. নতুন পোস্ট তৈরি করা (Private - Login Required)
router.post('/', checkJwt, async (req, res) => {
    try {
        const { text, media, mediaType, authorName, authorAvatar, authorId } = req.body;

        // সিকিউরিটির জন্য চেক করা হচ্ছে যে রিকোয়েস্টের authorId আর টোকেনের ইউজার এক কি না
        if (authorId !== req.user.sub) {
            return res.status(403).json({ message: "Identity mismatch!" });
        }

        const newPost = new Post({
            text,
            media,
            mediaType,
            authorName,
            authorAvatar,
            authorId
        });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        res.status(400).json({ message: "Post creation failed", error: err.message });
    }
});

// ৩. পোস্ট ডিলিট করা (Strictly Private - Only Author can delete)
router.delete('/:id', checkJwt, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // চেক করা হচ্ছে: টোকেনের ইউজার আইডি (req.user.sub) এবং পোস্টের মালিকের আইডি এক কি না
        if (post.authorId !== req.user.sub) {
            return res.status(401).json({ 
                message: "Unauthorized! You can only delete your own signals." 
            });
        }

        await post.deleteOne();
        res.json({ message: "Post deleted successfully", postId: req.params.id });
    } catch (err) {
        res.status(500).json({ message: "Delete failed", error: err.message });
    }
});

// ৪. পোস্ট লাইক করা (Private)
router.put('/:id/like', checkJwt, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const userId = req.user.sub;

        if (post.likes.includes(userId)) {
            // যদি আগে লাইক দেওয়া থাকে, তবে লাইক রিমুভ হবে (Unlike)
            post.likes = post.likes.filter(id => id !== userId);
        } else {
            // লাইক না দেওয়া থাকলে নতুন করে যোগ হবে
            post.likes.push(userId);
        }

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
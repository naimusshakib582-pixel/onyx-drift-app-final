import express from 'express';
import auth from '../middleware/auth.js'; 
import Post from '../models/Post.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const router = express.Router();

// --- ১. সব পোস্ট গেট করা (এটি না থাকায় ৪MD৪ আসছিল) ---
router.get('/', async (req, res) => {
  try {
    // ডাটাবেস থেকে সব পোস্ট বের করে আনা (নতুনগুলো আগে দেখাবে)
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Fetch Error:', err.message);
    res.status(500).send('Server error');
  }
});

// --- ২. নতুন পোস্ট তৈরি করা ---
router.post('/', auth, async (req, res) => {
  try {
    const { text, media, mediaType, authorName, authorAvatar, authorId } = req.body;

    const newPost = new Post({
      text,
      media,
      mediaType,
      authorName,
      authorAvatar,
      author: authorId || req.user.id, // Auth0 বা ম্যানুয়াল আইডি
      likes: [],
      comments: []
    });

    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error('Create Post Error:', err.message);
    res.status(500).send('Server error');
  }
});

// --- ৩. পোস্ট আপডেট/এডিট করা ---
router.put('/:id', auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    // Ownership Check
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    const { text, media } = req.body;
    const updatedData = {};
    if (text) updatedData.text = text;
    if (media) updatedData.media = media;

    post = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: updatedData },
      { new: true }
    );
    res.json(post);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// --- ৪. পোস্ট ডিলিট করা ---
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Post removed successfully' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// --- ৫. লাইক বা আনলাইক করা ---
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    const likeIndex = post.likes.indexOf(req.user.id);
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

export default router;
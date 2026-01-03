import express from 'express';
import auth from '../middleware/auth.js'; 
import Post from '../models/Post.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const router = express.Router();

// --- ৫. পোস্ট আপডেট/এডিট করা (শুধুমাত্র মালিক পারবে) ---
router.put('/:id', auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    // পোস্ট আছে কি না চেক
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // মালিকানা যাচাই (Ownership Check)
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized: You can only edit your own posts' });
    }

    const { text, media } = req.body;

    // নতুন ডাটা দিয়ে আপডেট
    const updatedData = {};
    if (text) updatedData.text = text;
    if (media) updatedData.media = media;

    post = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: updatedData },
      { new: true } // আপডেট হওয়ার পর নতুন ডাটা রিটার্ন করবে
    );

    res.json({ msg: 'Post updated successfully', post });
  } catch (err) {
    console.error('Update Error:', err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Post not found' });
    res.status(500).send('Server error');
  }
});

// --- ৬. পোস্ট ডিলিট করা (শুধুমাত্র মালিক পারবে) ---
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // মালিকানা যাচাই (Ownership Check)
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized: You can only delete your own posts' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Post removed successfully' });
  } catch (err) {
    console.error('Delete Error:', err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Post not found' });
    res.status(500).send('Server error');
  }
});

// --- ৭. লাইক বা আনলাইক করা (Neural Like Logic) ---
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    // চেক করা হচ্ছে ইউজার আইডি অলরেডি লাইক লিস্টে আছে কি না
    const likeIndex = post.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      // যদি থাকে, তবে রিমুভ (Unlike)
      post.likes.splice(likeIndex, 1);
    } else {
      // না থাকলে অ্যাড (Like)
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error('Like error:', err.message);
    res.status(500).send('Server error');
  }
});

export default router;
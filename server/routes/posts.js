import express from 'express';
import auth from '../middleware/auth.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const router = express.Router();

// ১. পোস্ট তৈরি করা (Create post)
router.post('/', auth, async (req, res) => {
  const { text, media } = req.body || {};
  try {
    const post = new Post({ 
      author: req.user.id, 
      text: text || '', 
      media: media || null 
    });
    await post.save();
    await post.populate('author', 'name avatar');
    res.json(post);
  } catch (err) {
    console.error('posts.create:', err);
    res.status(500).send('Server error');
  }
});

// ২. টাইমলাইন দেখা (Pagination সহ)
router.get('/', auth, async (req, res) => {
  const { feed, page = 1, limit = 5 } = req.query; 
  try {
    let query = {};
    if (feed === 'personal') {
      const me = await User.findById(req.user.id);
      query = { author: { $in: [...me.following, me.id] } };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Post.find(query)
      .populate('author', 'name avatar')
      .populate('comments.author', 'name avatar')
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(parseInt(limit));

    res.json(posts);
  } catch (err) {
    console.error('posts.getTimeline:', err);
    res.status(500).send('Server error');
  }
});

// ৩. একটি নির্দিষ্ট পোস্ট দেখা
router.get('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ msg: 'Invalid id' });
    const post = await Post.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('comments.author', 'name avatar');
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error('posts.get:', err);
    res.status(500).send('Server error');
  }
});

// ৪. পোস্ট আপডেট করা
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Not allowed' });

    const { text, media } = req.body || {};
    if (text !== undefined) post.text = text;
    if (media !== undefined) post.media = media;
    await post.save();
    res.json(post);
  } catch (err) {
    console.error('posts.update:', err);
    res.status(500).send('Server error');
  }
});

// ৫. পোস্ট ডিলিট করা
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    
    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Not allowed' });

    await Post.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error('posts.delete:', err);
    res.status(500).send('Server error');
  }
});

// ৬. লাইক বা আনলাইক করা
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    
    const liked = post.likes.some((u) => u.toString() === req.user.id);
    if (liked) {
      post.likes = post.likes.filter((u) => u.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }
    await post.save();
    return res.json({ likesCount: post.likes.length, isLiked: !liked });
  } catch (err) {
    console.error('posts.like:', err);
    res.status(500).send('Server error');
  }
});

// ৭. কমেন্ট যোগ করা
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ msg: 'Comment text required' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    
    const comment = { author: req.user.id, text };
    post.comments.push(comment);
    await post.save();
    await post.populate('comments.author', 'name avatar');
    res.json(post.comments[post.comments.length - 1]);
  } catch (err) {
    console.error('posts.addComment:', err);
    res.status(500).send('Server error');
  }
});

// ৮. কমেন্টের রিপ্লাই দেওয়া
router.post('/:postId/comments/:commentId/reply', auth, async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ msg: 'Reply text required' });
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });
    
    const reply = { author: req.user.id, text };
    comment.replies = comment.replies || [];
    comment.replies.push(reply);
    await post.save();
    await post.populate('comments.author comments.replies.author', 'name avatar');
    res.json(comment);
  } catch (err) {
    console.error('posts.reply:', err);
    res.status(500).send('Server error');
  }
});

export default router;
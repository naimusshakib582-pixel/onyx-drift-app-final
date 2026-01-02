import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import { createPost } from '../controllers/postController.js';

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

// Routes
router.post('/create', auth, upload.single('file'), createPost);

router.get('/user/:userId', auth, async (req, res) => {
  try {
    const Post = (await import('../models/Post.js')).default;
    const posts = await Post.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).send("Neural Link Error");
  }
});

export default router;
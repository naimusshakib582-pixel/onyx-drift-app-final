import express from "express";
import auth from "../middleware/auth.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/* =========================
   Cloudinary Configuration
========================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "onyx_drift_posts",
    resource_type: "auto", // ভিডিও এবং ইমেজ অটো ডিটেক্ট করবে
    allowed_formats: ["jpg", "png", "jpeg", "mp4", "mov", "webm"],
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // ১০০ এমবি লিমিট (ভিডিওর জন্য)
});

/* ==========================================================
    🔥 REELS ENGINE 
========================================================== */
router.get("/reels/all", async (req, res) => {
  try {
    const reels = await Post.find({ mediaType: "video" })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json(reels);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch neural reels" });
  }
});

/* =========================
    1️⃣ Get All Posts
========================= */
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(30).lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* =========================
    2️⃣ Create Post / Reel 
========================= */
router.post("/", auth, upload.single("media"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No media file detected" });
    }

    // Auth0 sub বা ID নিশ্চিত করা
    const currentUserId = req.user.sub || req.user.id;
    if (!currentUserId) {
      return res.status(401).json({ msg: "User identification failed" });
    }

    const userProfile = await User.findOne({ auth0Id: currentUserId });

    // ভিডিও না ইমেজ সেটা চেক করা
    const isVideo = req.file.mimetype.includes("video");
    const detectedType = isVideo ? "video" : "image";

    const postData = {
      author: currentUserId,           
      authorAuth0Id: currentUserId,    
      authorName: userProfile?.name || "Drifter",
      authorAvatar: userProfile?.avatar || "",
      text: req.body.text || "",
      media: req.file.path,            
      mediaType: detectedType,         
      likes: [],
      comments: [],
      views: 0
    };

    const post = await Post.create(postData);
    res.status(201).json(post);

  } catch (err) {
    console.error("🔥 POST CREATION FAILED:", err);
    res.status(500).json({ 
      msg: "Internal Neural Breakdown", 
      error: err.message 
    });
  }
});

/* =========================
    3️⃣ Get User Specific Posts
========================= */
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const decodedId = decodeURIComponent(req.params.userId);
    const posts = await Post.find({
      $or: [{ authorAuth0Id: decodedId }, { author: decodedId }],
    }).sort({ createdAt: -1 });
    res.json(posts || []);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch user posts" });
  }
});

/* =========================
    4️⃣ Like / Unlike Logic
========================= */
router.put("/:id/like", auth, async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const isLiked = post.likes.includes(userId);
    const update = isLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } };

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
    5️⃣ Delete Post
========================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const userId = req.user.sub || req.user.id;
    if (post.authorAuth0Id !== userId && post.author !== userId)
      return res.status(401).json({ msg: "Unauthorized" });

    await post.deleteOne();
    res.json({ msg: "Post terminated", postId: req.params.id });
  } catch (err) {
    res.status(500).json({ msg: "Delete failed" });
  }
});

/* =========================
    📡 THE VIRAL ENGINE
========================= */
router.get("/viral-feed", auth, async (req, res) => {
  try {
    const posts = await Post.find().lean();
    const now = new Date();

    const viralPosts = await Promise.all(
      posts.map(async (post) => {
        const authorProfile = await User.findOne({ auth0Id: post.authorAuth0Id || post.author }).lean();

        let engagementScore = (post.likes?.length || 0) * 1 + (post.comments?.length || 0) * 3;

        if (authorProfile) {
          const accountAgeInDays = (now - new Date(authorProfile.createdAt)) / (1000 * 60 * 60 * 24);
          if (accountAgeInDays < 30) engagementScore += 50;
          if (authorProfile.isVerified) engagementScore += 20;
        }

        const postAgeInHours = (now - new Date(post.createdAt)) / (1000 * 60 * 60);
        const gravity = 1.8;
        const finalScore = engagementScore / Math.pow(postAgeInHours + 2, gravity);

        return { ...post, authorData: authorProfile, viralRank: finalScore };
      })
    );

    viralPosts.sort((a, b) => b.viralRank - a.viralRank);
    res.json(viralPosts.slice(0, 20));
  } catch (err) {
    res.status(500).json({ msg: "Neural Uplink Failure" });
  }
});

/* =========================
    📡 PULSE ENGINE
========================= */
router.post("/:id/pulse", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ msg: "Post not found" });
    res.status(200).json({ msg: "Neural pulse recorded" });
  } catch (err) {
    res.status(500).json({ msg: "Pulse recording failed" });
  }
});

export default router;
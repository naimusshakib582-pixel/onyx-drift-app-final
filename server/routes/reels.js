import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Post from "../models/Post.js"; // আমরা রিলগুলোকে পোস্ট মডেল হিসেবেই সেভ করবো কিন্তু টাইপ থাকবে 'video'

const router = express.Router();

// ১. ক্লাউডিনারি স্টোরেজ কনফিগারেশন (ভিডিওর জন্য)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "onyx_reels",
    resource_type: "video", // এটি অবশ্যই 'video' হতে হবে
    allowed_formats: ["mp4", "mov", "webm"],
  },
});

const upload = multer({ storage: storage });

/* ==========================================================
   🚀 UPLOAD REEL
   Route: POST api/reels/upload
========================================================== */
router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const { caption, userId } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No video file provided" });
    }

    // ২. ডাটাবেসে নতুন রিল (পোস্ট হিসেবে) সেভ করা
    const newReel = new Post({
      authorId: userId,
      text: caption || "",
      mediaUrl: req.file.path, // ক্লাউডিনারি থেকে আসা ভিডিও ইউআরএল
      mediaType: "video",
      likes: [],
      comments: []
    });

    const savedReel = await newReel.save();
    res.status(201).json(savedReel);

  } catch (err) {
    console.error("Reel Upload Error:", err);
    res.status(500).json({ error: "Neural Uplink Failed: Reel storage error" });
  }
});

/* ==========================================================
   📺 GET ALL REELS
   Route: GET api/reels
========================================================== */
router.get("/", async (req, res) => {
  try {
    const reels = await Post.find({ mediaType: "video" }).sort({ createdAt: -1 });
    res.status(200).json(reels);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
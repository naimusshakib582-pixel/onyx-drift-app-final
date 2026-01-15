import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Post from "../models/Post.js"; 
import auth from "../middleware/auth.js";

const router = express.Router();

// ১. ক্লাউডিনারি স্টোরেজ কনফিগারেশন (ভিডিওর জন্য)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "onyx_reels",
    resource_type: "video", 
    allowed_formats: ["mp4", "mov", "webm", "quicktime"],
  },
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // ১০০ এমবি লিমিট
});

/* ==========================================================
    🚀 REEL UPLOAD (POST /api/reels/upload)
========================================================== */
router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    // ফ্রন্টএন্ড থেকে আসা ডেটা
    const { caption, userId, authorName, authorAvatar, authorAuth0Id } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No video file detected. Signal lost." });
    }

    // ২. নতুন পোস্ট তৈরি (সব সম্ভাব্য ফিল্ড কভার করা হয়েছে যাতে ৫০০ এরর না আসে)
    const newReel = new Post({
      author: userId || authorAuth0Id, // মডেল অনুযায়ী প্রধান আইডি
      authorAuth0Id: authorAuth0Id || userId, 
      authorId: userId,
      authorName: authorName || "Drifter",
      authorAvatar: authorAvatar || "",
      text: caption || "",
      media: req.file.path, 
      mediaUrl: req.file.path, 
      mediaType: "video", // এটি খুব জরুরি
      likes: [],
      comments: [],
      views: 0,
      createdAt: new Date()
    });

    const savedReel = await newReel.save();
    console.log("✅ Reel Uploaded Successfully:", savedReel._id);
    res.status(201).json(savedReel);

  } catch (err) {
    // Render Logs এ বিস্তারিত দেখার জন্য console.error রাখা হয়েছে
    console.error("🔥 REEL_UPLOAD_ERROR_DETAIL:", err);
    res.status(500).json({ 
        error: "Internal Neural Breakdown", 
        message: err.message 
    });
  }
});

/* ==========================================================
    📺 GET ALL REELS (GET /api/reels)
========================================================== */
router.get("/", async (req, res) => {
  try {
    // ভিডিও টাইপ পোস্টগুলো খুঁজে বের করা
    const reels = await Post.find({ 
        $or: [{ mediaType: "video" }, { mediaType: "reel" }] 
    }).sort({ createdAt: -1 });
    
    res.status(200).json(reels);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reels" });
  }
});

export default router;
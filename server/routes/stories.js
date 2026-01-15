import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Story from "../models/Story.js";

const router = express.Router();

// ১. ক্লাউডিনারি স্টোরেজ কনফিগারেশন
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "onyx_stories",
    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
  },
});

const upload = multer({ storage: storage });

/* ==========================================================
   📡 GET ALL STORIES (এটি না থাকার কারণেই 404 আসছিল)
   ========================================================== */
router.get("/", async (req, res) => {
  try {
    // ১২ ঘণ্টার বেশি পুরোনো স্টোরি ফিল্টার করার জন্য (ঐচ্ছিক লজিক)
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    
    const stories = await Story.find({
      createdAt: { $gte: twelveHoursAgo }
    }).sort({ createdAt: -1 });

    res.status(200).json(stories);
  } catch (err) {
    console.error("GET_STORIES_ERROR:", err);
    res.status(500).json({ message: "Could not fetch stories", error: err.message });
  }
});

/* ==========================================================
   📡 POST A NEW STORY
   ========================================================== */
router.post("/", upload.single("media"), async (req, res) => {
  try {
    // ইমেজ URL চেক
    const mediaUrl = req.file ? req.file.path : null;

    if (!mediaUrl) {
      return res.status(400).json({ message: "Image upload failed on Cloudinary or no file selected" });
    }

    // ফ্রন্টএন্ড থেকে আসা userId চেক (user.sub)
    if (!req.body.userId) {
      return res.status(400).json({ message: "User ID is required to sync story" });
    }

    const newStory = new Story({
      userId: req.body.userId,
      mediaUrl: mediaUrl,
      text: req.body.text || "",
      musicName: req.body.musicName || "",
      musicUrl: req.body.musicUrl || "",
      onlyMessenger: req.body.onlyMessenger === "true" || true // ডিফল্ট true
    });

    const savedStory = await newStory.save();
    res.status(200).json(savedStory);
  } catch (err) {
    console.error("STORY_POST_ERROR:", err);
    res.status(500).json({ message: "Server Side Error during upload", error: err.message });
  }
});

export default router;
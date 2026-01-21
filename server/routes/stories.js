import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Story from "../models/Story.js";

const router = express.Router();

// ১. ক্লাউডিনারি কনফিগারেশন চেক
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "onyx_stories",
      resource_type: "auto", // ইমেজ বা ভিডিও যাই হোক অটো ডিটেক্ট করবে
      allowed_formats: ["jpg", "png", "jpeg", "gif", "webp", "mp4", "mov"],
    };
  },
});

const upload = multer({ storage: storage });

/* ==========================================================
    📡 GET ALL STORIES
   ========================================================== */
router.get("/", async (req, res) => {
  try {
    // যেহেতু আপনার মডেলে TTL Index আছে, তাই ফিল্টার করার প্রয়োজন নেই, মঙ্গোডিবি নিজেই ডিলিট করবে
    const stories = await Story.find().sort({ createdAt: -1 });
    res.status(200).json(stories);
  } catch (err) {
    res.status(500).json({ message: "Fetch Error", error: err.message });
  }
});

/* ==========================================================
    📡 POST A NEW STORY
   ========================================================== */
router.post("/upload", upload.single("media"), async (req, res) => {
  try {
    // ১. ফাইল এসেছে কি না চেক
    if (!req.file) {
      console.error("No file found in request");
      return res.status(400).json({ message: "Please upload an image or video." });
    }

    // ২. রিকোয়েস্ট বডিতে ডাটা আছে কি না চেক
    const { userId, text, musicName, musicUrl, filter, onlyMessenger } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "UserId is missing in body." });
    }

    // ৩. নতুন স্টোরি অবজেক্ট তৈরি
    const newStory = new Story({
      userId: userId,
      mediaUrl: req.file.path, // ক্লাউডিনারি ইউআরএল
      text: text || "",
      musicName: musicName || "",
      musicUrl: musicUrl || "",
      filter: filter || "none",
      onlyMessenger: onlyMessenger === "false" ? false : true,
    });

    // ৪. ডেটাবেসে সেভ করা
    const savedStory = await newStory.save();
    console.log("Story saved successfully:", savedStory._id);
    
    res.status(200).json(savedStory);
  } catch (err) {
    console.error("BACKEND_STORY_ERROR:", err); // এটি আপনার রেন্ডার লগে দেখাবে
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

export default router;
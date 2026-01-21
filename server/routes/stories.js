import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Story from "../models/Story.js";

const router = express.Router();

// ১. ক্লাউডিনারি স্টোরেজ কনফিগারেশন (ভিডিও এবং ইমেজ দুইটাই সাপোর্ট করবে)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "onyx_stories",
      resource_type: "auto", // এটি ইমেজ এবং ভিডিও অটো ডিটেক্ট করবে
      allowed_formats: ["jpg", "png", "jpeg", "gif", "webp", "mp4", "mov"],
    };
  },
});

const upload = multer({ storage: storage });

/* ==========================================================
    📡 GET ALL STORIES (১০-১২ ঘণ্টার ফিল্টারসহ)
   ========================================================== */
router.get("/", async (req, res) => {
  try {
    // ২৪ ঘণ্টার পুরোনো স্টোরি সাধারণত দেখানো হয় না (আপনি চাইলে ১২ করতে পারেন)
    const timeLimit = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const stories = await Story.find({
      createdAt: { $gte: timeLimit }
    }).sort({ createdAt: -1 });

    res.status(200).json(stories);
  } catch (err) {
    console.error("GET_STORIES_ERROR:", err);
    res.status(500).json({ message: "Could not fetch stories", error: err.message });
  }
});

/* ==========================================================
    📡 POST A NEW STORY (Fixing the 404 issue by adding /upload)
   ========================================================== */
router.post("/upload", upload.single("media"), async (req, res) => {
  try {
    // ক্লাউডিনারি থেকে আসা ফাইল পাথ চেক
    const mediaUrl = req.file ? req.file.path : null;

    if (!mediaUrl) {
      return res.status(400).json({ message: "No media file uploaded or upload failed" });
    }

    // ফ্রন্টএন্ড থেকে আসা userId (user.sub)
    const { userId, text, musicName, musicUrl, onlyMessenger } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const newStory = new Story({
      userId: userId,
      mediaUrl: mediaUrl,
      text: text || "",
      musicName: musicName || "",
      musicUrl: musicUrl || "",
      onlyMessenger: onlyMessenger === "false" ? false : true 
    });

    const savedStory = await newStory.save();
    res.status(200).json(savedStory);
  } catch (err) {
    console.error("STORY_POST_ERROR:", err);
    res.status(500).json({ message: "Server Side Error during upload", error: err.message });
  }
});

/* ==========================================================
    📡 DELETE A STORY (ঐচ্ছিক: ইউজার নিজের স্টোরি ডিলিট করতে চাইলে)
   ========================================================== */
router.delete("/:id", async (req, res) => {
  try {
    await Story.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Story deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
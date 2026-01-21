import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Story from "../models/Story.js";

const router = express.Router();

// ১. ক্লাউডিনারি কনফিগারেশন
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "onyx_stories",
      resource_type: "auto", // ইমেজ এবং ভিডিও দুইটাই হ্যান্ডেল করবে
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
    // TTL Index (12h) এর কারণে অটোমেটিক ডিলিট হবে, তাই শুধু সব ডেটা আনলেই হবে
    const stories = await Story.find().sort({ createdAt: -1 });
    res.status(200).json(stories);
  } catch (err) {
    res.status(500).json({ message: "Fetch Error", error: err.message });
  }
});

/* ==========================================================
    📡 POST A NEW STORY (The /upload endpoint)
   ========================================================== */
router.post("/upload", upload.single("media"), async (req, res) => {
  try {
    // ফাইল চেক
    if (!req.file) {
      return res.status(400).json({ message: "No media file found in the request." });
    }

    const { userId, text, musicName, musicUrl, filter, onlyMessenger } = req.body;

    // ইউজার আইডি চেক
    if (!userId) {
      return res.status(400).json({ message: "User identity (userId) is required." });
    }

    const newStory = new Story({
      userId,
      mediaUrl: req.file.path, // Cloudinary Secure URL
      text: text || "",
      musicName: musicName || "",
      musicUrl: musicUrl || "",
      filter: filter || "None",
      onlyMessenger: onlyMessenger === "false" ? false : true,
    });

    const savedStory = await newStory.save();
    console.log("✅ Story Live:", savedStory._id);
    
    res.status(200).json(savedStory);
  } catch (err) {
    console.error("❌ BACKEND_STORY_ERROR:", err);
    res.status(500).json({ 
      message: "Internal Server Error during upload", 
      error: err.message 
    });
  }
});

/* ==========================================================
    📡 DELETE STORY (Optional)
   ========================================================== */
router.delete("/:id", async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json("Story not found");
    
    await Story.findByIdAndDelete(req.params.id);
    res.status(200).json("Story has been deleted.");
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
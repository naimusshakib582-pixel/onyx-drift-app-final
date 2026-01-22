import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Story from "../models/Story.js";

const router = express.Router();

// ক্লাউডিনারি স্টোরেজ কনফিগ
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // ফাইল টাইপ চেক করে ফোল্ডার ও রিসোর্স টাইপ সেট করা
    const isVideo = file.mimetype.includes("video");
    return {
      folder: "onyx_stories",
      resource_type: "auto", 
      allowed_formats: ["jpg", "png", "jpeg", "gif", "webp", "mp4", "mov"],
    };
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 } // ২০ এমবি লিমিট (ভিডিওর জন্য ভালো)
});

/* --- GET STORIES --- */
router.get("/", async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.status(200).json(stories);
  } catch (err) {
    res.status(500).json({ message: "Fetch Error", error: err.message });
  }
});

/* --- POST STORY (The main upload endpoint) --- */
router.post("/upload", upload.single("media"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No media file provided." });
    }

    const { userId, text, musicName, musicUrl, filter, onlyMessenger } = req.body;

    if (!userId || userId === "undefined") {
      return res.status(400).json({ message: "User identity (userId) is required and cannot be undefined." });
    }

    const newStory = new Story({
      userId,
      mediaUrl: req.file.path,
      text: text || "",
      musicName: musicName || "",
      musicUrl: musicUrl || "",
      filter: filter || "None",
      onlyMessenger: onlyMessenger === "false" ? false : true,
    });

    const savedStory = await newStory.save();
    console.log("✅ Story Saved Successfully");
    res.status(200).json(savedStory);
  } catch (err) {
    console.error("❌ SERVER ERROR DURING STORY UPLOAD:", err);
    res.status(500).json({ 
      message: "Server encountered an error", 
      error: err.message 
    });
  }
});

export default router;
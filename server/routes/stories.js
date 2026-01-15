import express from "express";
const router = express.Router();
import Story from "../models/Story.js"; // .js দিতে ভুলবেন না

// স্টোরি পোস্ট করা
router.post("/", async (req, res) => {
  const newStory = new Story(req.body);
  try {
    const savedStory = await newStory.save();
    res.status(200).json(savedStory);
  } catch (err) {
    res.status(500).json(err);
  }
});

// সব স্টোরি গেট করা
router.get("/", async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.status(200).json(stories);
  } catch (err) {
    res.status(500).json(err);
  }
});

// module.exports এর বদলে এটি ব্যবহার করুন
export default router;
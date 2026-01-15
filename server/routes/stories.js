const router = require("express").Router();
const Story = require("../models/Story");

// স্টোরি সেভ করা
router.post("/", async (req, res) => {
  try {
    const newStory = new Story(req.body);
    const savedStory = await newStory.save();
    res.status(200).json(savedStory);
  } catch (err) {
    res.status(500).json(err);
  }
});

// সব একটিভ স্টোরি দেখা
router.get("/", async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.status(200).json(stories);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
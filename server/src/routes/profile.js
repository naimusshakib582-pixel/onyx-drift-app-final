import express from "express";
import Profile from "../models/Profile.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  const profile = await Profile.findOne({ userId: req.params.userId });
  res.json(profile);
});

router.put("/:userId", async (req, res) => {
  const { name, avatar } = req.body;

  const profile = await Profile.findOneAndUpdate(
    { userId: req.params.userId },
    { name, avatar },
    { upsert: true, new: true }
  );

  res.json(profile);
});

export default router;

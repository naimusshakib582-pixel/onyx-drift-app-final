import express from "express";
import Community from "../models/Community.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ১. নতুন কমিউনিটি তৈরি
router.post("/create", auth, async (req, res) => {
  try {
    const { name, description, avatar } = req.body;
    const slug = name.toLowerCase().replace(/ /g, "-");
    
    const newCommunity = new Community({
      name,
      slug,
      description,
      avatar,
      creator: req.user.id,
      members: [req.user.id]
    });

    await newCommunity.save();
    res.json(newCommunity);
  } catch (err) {
    res.status(500).json({ msg: "Failed to create node" });
  }
});

// ২. কমিউনিটিতে জয়েন/লিভ করা
router.post("/:id/join", auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ msg: "Node not found" });

    const isMember = community.members.includes(req.user.id);
    const update = isMember 
      ? { $pull: { members: req.user.id } } 
      : { $addToSet: { members: req.user.id } };

    await Community.findByIdAndUpdate(req.params.id, update);
    res.json({ msg: isMember ? "Left Node" : "Joined Node", isMember: !isMember });
  } catch (err) {
    res.status(500).json({ msg: "Connection error" });
  }
});

export default router;
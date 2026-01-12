import express from "express";
import Community from "../models/Community.js";
import auth from "../middleware/auth.js"; // তোমার মিডলওয়্যার

const router = express.Router();

// ১. নতুন কমিউনিটি তৈরি (সাথে ইউনিক নেম চেক)
router.post("/create", auth, async (req, res) => {
  try {
    const { name, description, avatar, topic } = req.body;
    
    // নাম দিয়ে আগে চেক করা
    const existing = await Community.findOne({ name });
    if (existing) return res.status(400).json({ msg: "This Node name is already synchronized" });

    const slug = name.toLowerCase().replace(/ /g, "-");
    
    const newCommunity = new Community({
      name,
      slug,
      topic: topic || "General", // টপিক এড করা হলো
      description,
      avatar,
      creator: req.user.id,
      members: [req.user.id]
    });

    await newCommunity.save();
    res.json(newCommunity);
  } catch (err) {
    res.status(500).json({ msg: "Neural Error: Failed to create node" });
  }
});

// ২. সব কমিউনিটি গেট করা (Explorer পেজের জন্য)
router.get("/all", async (req, res) => {
  try {
    const communities = await Community.find()
      .sort({ createdAt: -1 })
      .populate("creator", "nickname profilePic"); // ক্রিয়েটরের তথ্যসহ
    res.json(communities);
  } catch (err) {
    res.status(500).json({ msg: "Sync error" });
  }
});

// ৩. জয়েন/লিভ লজিক (তোমার কোড ঠিক আছে, জাস্ট আপডেট রেসপন্স)
router.post("/:id/join", auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ msg: "Node not found" });

    const isMember = community.members.includes(req.user.id);
    const update = isMember 
      ? { $pull: { members: req.user.id } } 
      : { $addToSet: { members: req.user.id } };

    const updatedCommunity = await Community.findByIdAndUpdate(
      req.params.id, 
      update, 
      { new: true }
    );
    
    res.json({ 
      msg: isMember ? "Neural Connection Severed (Left)" : "Linked to Node (Joined)", 
      memberCount: updatedCommunity.members.length,
      isMember: !isMember 
    });
  } catch (err) {
    res.status(500).json({ msg: "Link failed" });
  }
});

export default router;
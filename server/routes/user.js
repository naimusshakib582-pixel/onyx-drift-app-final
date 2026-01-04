import express from 'express';
const router = express.Router();
import User from '../models/User.js'; 
import auth from '../middleware/auth.js'; 
import upload from '../middleware/multer.js'; 

// --- আপনার বর্তমান আপডেট প্রোফাইল রাউট (অপরিবর্তিত) ---
router.put("/update-profile", auth, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { nickname, bio, location, workplace } = req.body;
    let updateFields = {};
    if (nickname) updateFields.name = nickname;
    if (bio) updateFields.bio = bio;
    if (location) updateFields.location = location;
    if (workplace) updateFields.workplace = workplace;

    if (req.files) {
      if (req.files.avatar) updateFields.avatar = req.files.avatar[0].path;
      if (req.files.cover) updateFields.coverImg = req.files.cover[0].path;
    }

    const targetAuth0Id = req.user.sub || req.user.id;
    console.log("Synchronizing Identity for:", targetAuth0Id);

    const updatedUser = await User.findOneAndUpdate(
      { auth0Id: targetAuth0Id }, 
      { $set: updateFields },
      { new: true, upsert: true }
    );

    if (!updatedUser) return res.status(404).json({ msg: "Neural Identity not found" });
    res.json(updatedUser);
  } catch (err) {
    console.error("Critical Sync Error:", err);
    res.status(500).json({ msg: 'Identity Synchronization Failed', error: err.message });
  }
});

// --- নতুন যোগ করা রাউটসমূহ নিচে দেওয়া হলো ---

// ১. সার্চ রাউট: যে কেউ অ্যাকাউন্ট খুললে তাকে আইডি দিয়ে বা নাম দিয়ে খুঁজে পাওয়া যাবে
router.get("/search", auth, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { nickname: { $regex: query, $options: "i" } },
        { auth0Id: query } // আইডি দিয়ে সার্চ দিলেও পাওয়া যাবে
      ]
    }).select("name avatar auth0Id location isPremium");

    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Search Failed" });
  }
});

// ২. প্রোফাইল দেখা: আইডি দিয়ে সার্চ দিলে সরাসরি প্রোফাইল ডাটা আসবে
router.get("/profile/:id", auth, async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.params.id })
      .populate("friends", "name avatar auth0Id");
    
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching profile" });
  }
});

// ৩. ফ্রেন্ড রিকোয়েস্ট পাঠানো (Add Friend)
router.post("/friend-request/:targetAuth0Id", auth, async (req, res) => {
  try {
    const senderId = req.user.sub || req.user.id;
    const targetId = req.params.targetAuth0Id;

    if (senderId === targetId) return res.status(400).json({ msg: "Cannot add yourself" });

    // টার্গেট ইউজারের pendingRequests লিস্টে রিকোয়েস্ট পাঠানো
    await User.findOneAndUpdate(
      { auth0Id: targetId },
      { $addToSet: { pendingRequests: senderId } }
    );

    res.json({ msg: "Neural Link Request Sent" });
  } catch (err) {
    res.status(500).json({ msg: "Request Failed" });
  }
});

// ৪. ফ্রেন্ড রিকোয়েস্ট একসেপ্ট করা
router.post("/accept-friend/:senderAuth0Id", auth, async (req, res) => {
  try {
    const myId = req.user.sub || req.user.id;
    const friendId = req.params.senderAuth0Id;

    // ১. নিজের লিস্ট থেকে রিকোয়েস্ট সরানো এবং ফ্রেন্ড লিস্টে অ্যাড করা
    await User.findOneAndUpdate(
      { auth0Id: myId },
      { 
        $pull: { pendingRequests: friendId },
        $addToSet: { friends: friendId } 
      }
    );

    // ২. বন্ধুর ফ্রেন্ড লিস্টেও নিজেকে অ্যাড করা
    await User.findOneAndUpdate(
      { auth0Id: friendId },
      { $addToSet: { friends: myId } }
    );

    res.json({ msg: "Neural Link Established" });
  } catch (err) {
    res.status(500).json({ msg: "Acceptance Failed" });
  }
});

export default router;
import express from 'express';
import User from '../models/User.js'; 
import auth from '../middleware/auth.js'; 
import upload from '../middleware/multer.js';

const router = express.Router();

/* ==========================================================
    1️⃣ GET PROFILE BY ID (With Auto-Sync to fix 404 Error)
========================================================== */
// এখানে ['/:id', '/profile/:id'] ব্যবহার করা হয়েছে যাতে দুই ধরণের URL-ই কাজ করে
router.get(['/:id', '/profile/:id'], auth, async (req, res) => {
  try {
    // ফ্রন্টএন্ড থেকে আসা আইডি ডিকোড করা
    const targetId = decodeURIComponent(req.params.id);
    
    // ডাটাবেসে ইউজার খুঁজুন (auth0Id ফিল্ড দিয়ে)
    let user = await User.findOne({ auth0Id: targetId })
      .select("-__v")
      .lean();
    
    // ✅ ফিক্স: যদি ইউজার ডাটাবেসে না থাকে
    if (!user) {
      // যদি রিকোয়েস্ট করা আইডিটি লগইন করা ইউজারের নিজের হয়, তবে অটো-ক্রিয়েট হবে
      const myId = req.user.sub || req.user.id;
      
      if (targetId === myId) {
        const newUser = new User({
          auth0Id: myId,
          name: req.user.name || "Drifter",
          nickname: req.user.nickname || "drifter",
          avatar: req.user.picture || "",
          isVerified: false
        });
        const savedUser = await newUser.save();
        user = savedUser.toObject();
        console.log("🆕 New Neural Identity Synced:", targetId);
      } else {
        // অন্য কারও প্রোফাইল হলে এবং সে ডাটাবেসে না থাকলে ৪MD৪ দিবে
        return res.status(404).json({ msg: "Drifter not found in neural network" });
      }
    }
    
    res.json(user);
  } catch (err) {
    console.error("📡 Profile Fetch Error:", err);
    res.status(500).json({ msg: "Neural link interrupted" });
  }
});

/* ==========================================================
    2️⃣ UPDATE PROFILE (Identity Synchronization)
========================================================== */
router.put("/update-profile", auth, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { nickname, name, bio, location, workplace } = req.body;
    const targetAuth0Id = req.user.sub || req.user.id;

    let updateFields = { name, nickname, bio, location, workplace };

    if (req.files) {
      if (req.files.avatar) updateFields.avatar = req.files.avatar[0].path;
      if (req.files.cover) updateFields.coverImg = req.files.cover[0].path;
    }

    Object.keys(updateFields).forEach(key => 
      (updateFields[key] === undefined || updateFields[key] === "") && delete updateFields[key]
    );

    const updatedUser = await User.findOneAndUpdate(
      { auth0Id: targetAuth0Id }, 
      { $set: updateFields },
      { new: true, upsert: true, lean: true }
    );

    res.json(updatedUser);
  } catch (err) {
    console.error("📡 Profile Update Error:", err);
    res.status(500).json({ msg: 'Identity Sync Failed' });
  }
});

/* ==========================================================
    3️⃣ SEARCH DRIFTERS (Neural Scan)
========================================================== */
router.get("/search", auth, async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user.sub || req.user.id;

    if (!query) {
       // কুয়েরি না থাকলে কিছু ইউজার রিটার্ন করা
       const all = await User.find({ auth0Id: { $ne: currentUserId } }).limit(10).lean();
       return res.json(all);
    }

    const searchRegex = new RegExp(`${query.trim()}`, "i");

    const users = await User.find({
      auth0Id: { $ne: currentUserId },
      $or: [
        { name: { $regex: searchRegex } },
        { nickname: { $regex: searchRegex } }
      ]
    })
    .select("name nickname avatar auth0Id bio isVerified")
    .limit(10)
    .lean();

    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Search signal lost" });
  }
});

/* ==========================================================
    4️⃣ FOLLOW / UNFOLLOW SYSTEM
========================================================== */
router.post("/follow/:targetId", auth, async (req, res) => {
  try {
    const myId = req.user.sub || req.user.id;
    const targetId = decodeURIComponent(req.params.targetId);

    if (myId === targetId) return res.status(400).json({ msg: "Self-link forbidden" });

    const targetUser = await User.findOne({ auth0Id: targetId });
    if (!targetUser) return res.status(404).json({ msg: "Target not found" });

    const isFollowing = targetUser.followers?.includes(myId);

    if (isFollowing) {
      await Promise.all([
        User.updateOne({ auth0Id: myId }, { $pull: { following: targetId } }),
        User.updateOne({ auth0Id: targetId }, { $pull: { followers: myId } })
      ]);
      res.json({ followed: false });
    } else {
      await Promise.all([
        User.updateOne({ auth0Id: myId }, { $addToSet: { following: targetId } }),
        User.updateOne({ auth0Id: targetId }, { $addToSet: { followers: myId } })
      ]);
      res.json({ followed: true });
    }
  } catch (err) {
    res.status(500).json({ msg: "Connection failed" });
  }
});

/* ==========================================================
    5️⃣ DISCOVERY
========================================================== */
router.get("/all", auth, async (req, res) => {
  try {
    const currentUserId = req.user.sub || req.user.id;
    const users = await User.find({ auth0Id: { $ne: currentUserId } })
      .select("name nickname avatar auth0Id bio isVerified")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Discovery signal lost" });
  }
});

export default router;
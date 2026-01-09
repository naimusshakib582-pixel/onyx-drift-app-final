import express from "express";
import multer from "multer";
import mongoose from "mongoose"; 
import { v2 as cloudinary } from "cloudinary";
import auth from "../../middleware/auth.js";
import User from "../../models/User.js";

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/* ==========================================================
    ১. GET ALL USERS
========================================================== */
router.get("/all", auth, async (req, res) => {
  try {
    const users = await User.find().select("name nickname avatar auth0Id isVerified bio");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch users" });
  }
});

/* ==========================================================
    ২. FOLLOW / UNFOLLOW SYSTEM (FIXED)
========================================================== */
router.post("/follow/:targetId", auth, async (req, res) => {
  try {
    const myAuth0Id = req.user.id || req.user.sub;
    const { targetId } = req.params;

    // ১. নিজের প্রোফাইল খুঁজে বের করা
    const me = await User.findOne({ auth0Id: myAuth0Id });
    if (!me) return res.status(404).json({ msg: "Your profile not found" });

    // ২. যাকে ফলো করবেন তাকে আইডি বা Auth0Id যেকোনোটি দিয়ে খুঁজে বের করা
    const targetUser = await User.findOne({
      $or: [
        { auth0Id: targetId },
        { _id: mongoose.Types.ObjectId.isValid(targetId) ? targetId : null }
      ]
    });

    if (!targetUser) return res.status(404).json({ msg: "Target user not found" });

    // নিজেকে নিজে ফলো করা আটকাতে
    if (me.auth0Id === targetUser.auth0Id) {
      return res.status(400).json({ msg: "Cannot follow yourself" });
    }

    // ৩. চেক করা অলরেডি ফলো করা আছে কি না
    // আমরা সব সময় Auth0Id অ্যারেতে সেভ রাখবো কনসিস্টেন্সির জন্য
    const isFollowing = me.following.includes(targetUser.auth0Id);

    if (isFollowing) {
      // UNFOLLOW লজিক
      await Promise.all([
        User.findOneAndUpdate({ auth0Id: me.auth0Id }, { $pull: { following: targetUser.auth0Id } }),
        User.findOneAndUpdate({ auth0Id: targetUser.auth0Id }, { $pull: { followers: me.auth0Id } })
      ]);
      res.json({ msg: "Unfollowed successfully", isFollowing: false });
    } else {
      // FOLLOW লজিক
      await Promise.all([
        User.findOneAndUpdate({ auth0Id: me.auth0Id }, { $addToSet: { following: targetUser.auth0Id } }),
        User.findOneAndUpdate({ auth0Id: targetUser.auth0Id }, { $addToSet: { followers: me.auth0Id } })
      ]);
      res.json({ msg: "Followed successfully", isFollowing: true });
    }
  } catch (err) {
    console.error("Follow Error:", err);
    res.status(500).json({ msg: "Follow action failed", error: err.message });
  }
});

/* ==========================================================
    ৩. GET PROFILE BY ID
========================================================== */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ 
      $or: [
        { auth0Id: userId }, 
        { _id: mongoose.Types.ObjectId.isValid(userId) ? userId : null }
      ] 
    }).select("-password");

    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).send("Neural Fetch Failed");
  }
});

/* ==========================================================
    ৪. UPDATE PROFILE
========================================================== */
router.put('/update-profile', auth, upload.fields([{ name: 'avatar' }, { name: 'cover' }]), async (req, res) => {
  try {
    const { nickname, bio, location, workplace } = req.body;
    let updateFields = { nickname, bio, location, workplace };

    if (req.files && req.files['avatar']) {
      const avatarRes = await cloudinary.uploader.upload(req.files['avatar'][0].path, { folder: "onyx_profiles/avatars" });
      updateFields.avatar = avatarRes.secure_url;
    }

    if (req.files && req.files['cover']) {
      const coverRes = await cloudinary.uploader.upload(req.files['cover'][0].path, { folder: "onyx_profiles/covers" });
      updateFields.coverImg = coverRes.secure_url;
    }

    const targetId = req.user.id || req.user.sub;
    const updatedUser = await User.findOneAndUpdate(
      { auth0Id: targetId }, 
      { $set: updateFields }, 
      { new: true, upsert: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ msg: "Update Failed", error: err.message });
  }
});

export default router;
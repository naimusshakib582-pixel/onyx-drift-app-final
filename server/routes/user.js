import express from 'express';
const router = express.Router();
import User from '../models/User.js'; // আপনার ইউজার মডেল পাথ চেক করে নিন
import auth from '../middleware/auth.js'; // আপনার অথ মিডলওয়্যার
import upload from '../middleware/multer.js'; // আপনার মাল্টার ও ক্লাউডিনারি কনফিগ

// @route   PUT api/user/update-profile
// @desc    Update user identity (Avatar, Cover, Bio, etc.)
// @access  Private
router.put("/update-profile", auth, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { nickname, bio, location, workplace } = req.body;
    
    // ১. ডাটাবেসে যে ফিল্ডগুলো আপডেট হবে সেগুলো সাজানো
    // স্কিমা অনুযায়ী name, bio, location, workplace সেট করছি
    let updateFields = {};
    if (nickname) updateFields.name = nickname;
    if (bio) updateFields.bio = bio;
    if (location) updateFields.location = location;
    if (workplace) updateFields.workplace = workplace;

    // ২. ইমেজ ফাইল চেক করা (Cloudinary Path)
    if (req.files) {
      if (req.files.avatar) {
        // Multer-Cloudinary 'path' প্রোভাইড করে যা সরাসরি URL হিসেবে কাজ করে
        updateFields.avatar = req.files.avatar[0].path;
      }
      if (req.files.cover) {
        // আপনার স্কিমার 'coverImg' ফিল্ডের সাথে মিলানো হলো
        updateFields.coverImg = req.files.cover[0].path;
      }
    }

    // ৩. সঠিক ID দিয়ে ইউজারকে খুঁজে আপডেট করা
    // Auth0 sub আইডি সাধারণত req.user.sub অথবা req.user.id-তে থাকে
    const targetAuth0Id = req.user.sub || req.user.id;

    console.log("Synchronizing Identity for:", targetAuth0Id);

    const updatedUser = await User.findOneAndUpdate(
      { auth0Id: targetAuth0Id }, 
      { $set: updateFields },
      { new: true, upsert: true } // upsert: true মানে ইউজার না থাকলে নতুন বানাবে
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: "Neural Identity not found in database" });
    }

    // ৪. সফল রেসপন্স পাঠানো
    res.json(updatedUser);

  } catch (err) {
    console.error("Critical Sync Error:", err);
    res.status(500).json({ 
      msg: 'Identity Synchronization Failed', 
      error: err.message 
    });
  }
});

export default router;
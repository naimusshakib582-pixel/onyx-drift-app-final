import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import auth from "../../middleware/auth.js";
import User from "../../models/User.js"; // পাথ ঠিক আছে কিনা চেক করে নিন

const router = express.Router(); // ১. সবার আগে রাউটার ডিক্লেয়ার করতে হবে

// ২. Multer Setup
const upload = multer({ dest: 'uploads/' });

// ৩. প্রোফাইল আপডেট (ইমেজ সহ)
router.put('/update-profile', auth, upload.fields([{ name: 'avatar' }, { name: 'cover' }]), async (req, res) => {
  try {
    const { nickname, bio, location } = req.body;
    let updateFields = { nickname, bio, location };

    // যদি নতুন ইমেজ থাকে তবে Cloudinary-তে আপলোড হবে
    if (req.files && req.files['avatar']) {
      const avatarRes = await cloudinary.uploader.upload(req.files['avatar'][0].path, {
        folder: "onyx_profiles/avatars"
      });
      updateFields.picture = avatarRes.secure_url;
    }

    if (req.files && req.files['cover']) {
      const coverRes = await cloudinary.uploader.upload(req.files['cover'][0].path, {
        folder: "onyx_profiles/covers"
      });
      updateFields.coverImg = coverRes.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateFields, { new: true });
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send("Update Failed");
  }
});

// ৪. ইউজারের প্রোফাইল ডাটা পাওয়া (GET)
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password"); // পাসওয়ার্ড ছাড়া সব নিবে
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).send("Neural Fetch Failed");
  }
});

// ৫. সাধারণ প্রোফাইল আপডেট (PUT) - এটি আগেরটির সাথে মার্জ করা যেতে পারে
router.put("/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, avatar } = req.body;
    // লজিক এখানে হবে
    res.json({
      userId,
      name,
      avatar,
      message: "Profile basic info updated successfully",
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

export default router;
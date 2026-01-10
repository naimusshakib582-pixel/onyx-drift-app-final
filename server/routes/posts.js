import express from "express";
import auth from "../middleware/auth.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

/* =========================
   Cloudinary Storage Configuration
========================= */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "onyx_drift_posts",
    resource_type: "auto",
    allowed_formats: ["jpg", "png", "jpeg", "mp4", "mov", "webm"],
  },
});

const upload = multer({ storage });

/* =========================
   1️⃣ Get All Posts (Global Feed)
========================= */
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(30)
      .lean(); // পারফরম্যান্সের জন্য lean() ব্যবহার করা হয়েছে
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* =========================
   2️⃣ Create Post (ID Mapping Fixed)
========================= */
router.post("/", auth, upload.single("media"), async (req, res) => {
  try {
    const { text, mediaType } = req.body;
    const currentUserId = req.user.id; // Auth0 sub ID

    // ১. ডাটাবেস থেকে ইউজারের লেটেস্ট তথ্য খুঁজে বের করা (নিরাপদ পদ্ধতি)
    const userProfile = await User.findOne({ auth0Id: currentUserId });

    const postData = {
      text,
      media: req.file?.path || null,
      mediaType: mediaType || (req.file?.mimetype?.includes("video") ? "video" : "image"),
      // ইউজারের তথ্য প্রোফাইল থেকে নেওয়া হচ্ছে, ফ্রন্টএন্ডের ওপর নির্ভরতা কমানো হলো
      authorName: userProfile?.name || "Unknown Drifter",
      authorAvatar: userProfile?.avatar || "",
      authorAuth0Id: currentUserId, // এটিই ফ্রন্টএন্ডে লিঙ্কিং এর কাজ করবে
      author: currentUserId,
    };

    const post = await Post.create(postData);
    res.status(201).json(post);
  } catch (err) {
    console.error("Post Creation Error:", err);
    res.status(500).json({ msg: "Transmission failed", error: err.message });
  }
});

/* =========================
   3️⃣ Get User Specific Posts
========================= */
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const decodedId = decodeURIComponent(req.params.userId);
    const posts = await Post.find({ 
      $or: [{ authorAuth0Id: decodedId }, { author: decodedId }] 
    }).sort({ createdAt: -1 });

    res.json(posts || []);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch user posts" });
  }
});

/* =========================
   4️⃣ Like / Unlike Logic
========================= */
router.put("/:id/like", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const isLiked = post.likes.includes(userId);
    const update = isLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } };

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   5️⃣ Delete Post
========================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (post.author !== req.user.id && post.authorAuth0Id !== req.user.id)
      return res.status(401).json({ msg: "Unauthorized" });

    await post.deleteOne();
    res.json({ msg: "Post terminated", postId: req.params.id });
  } catch (err) {
    res.status(500).json({ msg: "Delete failed" });
  }
});

/* =========================
   6️⃣ Friend Requests Logic
========================= */
router.post("/friend-request/:targetUserId", auth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { targetUserId } = req.params;

    if (senderId === targetUserId)
      return res.status(400).json({ msg: "Cannot add yourself" });

    await User.updateOne(
      { auth0Id: targetUserId }, 
      { $addToSet: { friendRequests: senderId } }
    );

    res.json({ msg: "Signal sent successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Friend request failed" });
  }
});

export default router;
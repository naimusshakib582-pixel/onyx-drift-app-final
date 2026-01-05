import express from "express";
import auth from "../middleware/auth.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

/* =========================
   Cloudinary Storage
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
      .limit(30); // ইউজার এক্সপেরিয়েন্স বাড়াতে লিমিট বাড়ানো হয়েছে
    res.json(posts);
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

/* =========================
   2️⃣ Get User Posts (FIXED 404)
========================= */
router.get("/user/:userId", auth, async (req, res) => {
  try {
    // URL-এর আইডি ডিকোড করা google-oauth2|... এর জন্য
    const decodedId = decodeURIComponent(req.params.userId);
    const posts = await Post.find({ author: decodedId })
      .sort({ createdAt: -1 });

    res.json(posts || []);
  } catch {
    res.status(500).json({ msg: "Failed to fetch user posts" });
  }
});

/* =========================
   3️⃣ Like / Unlike (Fastest Logic)
========================= */
router.put("/:id/like", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    // লাইক আছে কি নেই তা চেক করে এক কোয়েরিতে আপডেট
    const isLiked = post.likes.includes(userId);
    const update = isLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } };

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   4️⃣ Send Friend Request (ID Fixed)
========================= */
router.post("/friend-request/:targetUserId", auth, async (req, res) => {
  const senderId = req.user.id;
  const { targetUserId } = req.params;

  if (senderId === targetUserId)
    return res.status(400).json({ msg: "Cannot add yourself" });

  // auth0Id ব্যবহার করা হয়েছে যাতে রেন্ডার সার্ভারের এরর না আসে
  await User.updateOne(
    { auth0Id: targetUserId }, 
    { $addToSet: { friendRequests: senderId } }
  );

  res.json({ msg: "Signal sent successfully" });
});

/* =========================
   5️⃣ Accept Friend Request (Parallel)
========================= */
router.post("/friend-accept/:senderId", auth, async (req, res) => {
  const receiverId = req.user.id;
  const senderId = req.params.senderId;

  // Promise.all ব্যবহার করে সময় বাঁচানো হয়েছে
  await Promise.all([
    User.updateOne(
      { auth0Id: receiverId },
      { $pull: { friendRequests: senderId }, $addToSet: { friends: senderId } }
    ),
    User.updateOne(
      { auth0Id: senderId },
      { $addToSet: { friends: receiverId } }
    ),
  ]);

  res.json({ msg: "Neural Link Established!" });
});

/* =========================
   6️⃣ Create Post (Validation Fixed)
========================= */
router.post("/create", auth, upload.single("media"), async (req, res) => {
  try {
    const { text, mediaType, authorName, authorAvatar } = req.body;

    // authorName ছাড়া ডাটাবেস এরর দেবে, তাই ডিফল্ট হ্যান্ডলিং
    const post = await Post.create({
      text,
      media: req.file?.path || null,
      mediaType: mediaType || (req.file?.mimetype.includes("video") ? "video" : "image"),
      authorName: authorName || "Unknown Drifter",
      authorAvatar: authorAvatar || "",
      author: req.user.id,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ msg: "Transmission failed", error: err.message });
  }
});

/* =========================
   7️⃣ Delete Post
========================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.author !== req.user.id)
      return res.status(401).json({ msg: "Unauthorized" });

    await post.deleteOne();
    res.json({ msg: "Post terminated", postId: req.params.id });
  } catch {
    res.status(500).json({ msg: "Delete failed" });
  }
});

export default router;
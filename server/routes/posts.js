import express from "express";
import auth from "../middleware/auth.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/* ==========================================================
    ☁️ Cloudinary & Multer Configuration
========================================================== */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "onyx_drift_posts",
    resource_type: "auto", // অটোমেটিক ভিডিও বা ইমেজ ডিটেক্ট করবে
    allowed_formats: ["jpg", "png", "jpeg", "mp4", "mov", "webm"],
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // ১০০ এমবি লিমিট
});

/* ==========================================================
    🚀 1. CREATE POST / REEL (POST /api/posts)
========================================================== */
router.post("/", auth, upload.single("media"), async (req, res) => {
  try {
    // ১. ফাইল চেক
    if (!req.file) {
      return res.status(400).json({ msg: "No media file detected. Signal lost." });
    }

    // ২. ইউজার আইডেন্টিটি চেক (auth middleware থেকে আসা)
    const currentUserId = req.user.sub || req.user.id;
    if (!currentUserId) {
      return res.status(401).json({ msg: "User identification failed" });
    }

    // ৩. ইউজারের নাম ও প্রোফাইল ডাটা ফেচ করা
    const userProfile = await User.findOne({ auth0Id: currentUserId }).lean();

    // ৪. ফাইল টাইপ ডিটেকশন (image/video/reel)
    const isVideo = req.file.mimetype.includes("video");
    let detectedType = isVideo ? "video" : "image";
    
    // যদি ফ্রন্টএন্ড থেকে স্পেসিফিকভাবে 'reel' পাঠানো হয়
    if (req.body.isReel === "true" && isVideo) {
      detectedType = "reel";
    }

    const postData = {
      author: currentUserId,           
      authorAuth0Id: currentUserId,    
      authorName: userProfile?.name || "Drifter",
      authorAvatar: userProfile?.avatar || "",
      text: req.body.text || "",
      media: req.file.path, // Cloudinary URL            
      mediaType: detectedType,         
      likes: [],
      comments: [],
      views: 0
    };

    const post = await Post.create(postData);
    res.status(201).json(post);

  } catch (err) {
    console.error("🔥 POST_CREATION_CRASH:", err);
    res.status(500).json({ 
      msg: "Internal Neural Breakdown", 
      error: err.message 
    });
  }
});

/* ==========================================================
    🔥 2. REELS ENGINE (GET /api/posts/reels/all)
========================================================== */
router.get("/reels/all", async (req, res) => {
  try {
    // ভিডিও এবং রিল উভয়ই এই ক্যাটাগরিতে পড়বে
    const reels = await Post.find({ 
      mediaType: { $in: ["video", "reel"] } 
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json(reels);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch neural reels" });
  }
});

/* ==========================================================
    📡 3. THE VIRAL ENGINE (GET /api/posts/viral-feed)
========================================================== */
router.get("/viral-feed", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(50).lean();
    const now = new Date();

    const viralPosts = posts.map((post) => {
      // এনগেজমেন্ট স্কোর ক্যালকুলেশন
      let engagementScore = (post.likes?.length || 0) * 1.5 + (post.comments?.length || 0) * 4;

      // টাইম গ্র্যাভিটি (পুরানো পোস্টের র‍্যাঙ্ক কমে যাবে)
      const postAgeInHours = (now - new Date(post.createdAt)) / (1000 * 60 * 60);
      const gravity = 1.8;
      const finalScore = engagementScore / Math.pow(postAgeInHours + 2, gravity);

      return { ...post, viralRank: finalScore };
    });

    // র‍্যাঙ্ক অনুযায়ী সাজানো
    viralPosts.sort((a, b) => b.viralRank - a.viralRank);
    res.json(viralPosts.slice(0, 20));
  } catch (err) {
    res.status(500).json({ msg: "Neural Uplink Failure", error: err.message });
  }
});

/* ==========================================================
    👤 4. USER SPECIFIC POSTS (GET /api/posts/user/:userId)
========================================================== */
router.get("/user/:userId", async (req, res) => {
  try {
    const decodedId = decodeURIComponent(req.params.userId);
    const posts = await Post.find({
      $or: [{ authorAuth0Id: decodedId }, { author: decodedId }],
    }).sort({ createdAt: -1 }).lean();
    res.json(posts || []);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch user posts" });
  }
});

/* ==========================================================
    ❤️ 5. LIKE / UNLIKE (PUT /api/posts/:id/like)
========================================================== */
router.put("/:id/like", auth, async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const isLiked = post.likes.includes(userId);
    const update = isLiked 
      ? { $pull: { likes: userId } } 
      : { $addToSet: { likes: userId } };

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================================
    🗑️ 6. DELETE POST (DELETE /api/posts/:id)
========================================================== */
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const userId = req.user.sub || req.user.id;
    if (post.authorAuth0Id !== userId && post.author !== userId)
      return res.status(401).json({ msg: "Access Denied: Not your data" });

    await post.deleteOne();
    res.json({ msg: "Post terminated", postId: req.params.id });
  } catch (err) {
    res.status(500).json({ msg: "Deletion failed" });
  }
});

export default router;
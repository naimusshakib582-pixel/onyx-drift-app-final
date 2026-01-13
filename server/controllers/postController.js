import { v2 as cloudinary } from 'cloudinary';
import Post from '../models/Post.js';
import User from '../models/User.js'; // ইউজার ইনফো আনার জন্য প্রয়োজন

// Cloudinary কনফিগারেশন
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

export const createPost = async (req, res) => {
  try {
    const { content, type } = req.body; 
    const currentUserId = req.user.sub || req.user.id; // Auth0 আইডি নিশ্চিত করা
    
    let mediaUrl = "";
    let publicId = "";

    // ১. মিডিয়া আপলোড লজিক
    if (req.file) {
      const resourceType = type === 'video' ? 'video' : 'image';
      
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        resource_type: resourceType,
        folder: "onyx_drift_media",
      });
      
      mediaUrl = uploadRes.secure_url;
      publicId = uploadRes.public_id;
    }

    // ২. ইউজার প্রোফাইল থেকে নাম ও অবতার সংগ্রহ (ঐচ্ছিক কিন্তু ভালো)
    const userProfile = await User.findOne({ auth0Id: currentUserId }).lean();

    // ৩. নতুন পোস্ট অবজেক্ট (আইডি ম্যাপিং ফিক্সড)
    const newPost = new Post({
      // আপনার userRoutes-এর সার্চের সাথে মিল রেখে এই ফিল্ডগুলো সেট করা হয়েছে
      authorAuth0Id: currentUserId, 
      authorId: currentUserId,
      authorName: userProfile?.name || req.user.name || "Unknown Drifter",
      authorAvatar: userProfile?.avatar || req.user.picture || "",
      
      // কন্টেন্ট এবং মিডিয়া
      text: content, // মডেলে 'text' থাকলে এটি ব্যবহার করুন
      content: content, // মডেলে 'content' থাকলে এটিও থাকলো
      media: mediaUrl,
      mediaUrl: mediaUrl,
      mediaType: type || 'photo',
      publicId: publicId,
      // রিলস হিসেবে চিহ্নিত করার জন্য (যদি রিলস থেকে কল হয়)
      postType: type === 'video' ? 'reels' : 'post' 
    });

    // ৪. ডাটাবেসে সেভ করা
    await newPost.save();
    
    console.log(`[Post Created]: Signal transmitted by ${currentUserId}`);
    res.status(201).json(newPost);

  } catch (err) {
    console.error("Neural Upload Error:", err);
    res.status(500).json({ msg: "Neural Upload Failed" });
  }
};

/* ==========================================================
    নতুন অংশ: রিলস (Reels) স্পেসিফিক স্মার্ট লজিক
========================================================== */

// ১. রিলস ফেচ করার কন্ট্রোলার (Viral Algorithm + Instant Loading)
export const getReels = async (req, res) => {
  try {
    // স্মার্ট অ্যালগরিদম: লাইক সংখ্যা এবং নতুন ভিডিওকে প্রাধান্য দেওয়া
    const reels = await Post.aggregate([
      { 
        $match: { 
          $or: [
            { postType: 'reels' }, 
            { mediaType: 'video' }
          ] 
        } 
      },
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ["$likes", []] } },
          // স্কোর ক্যালকুলেশন: লাইক এবং রিসেন্টনেস এর সমন্বয়
          algoScore: {
            $add: [
              { $size: { $ifNull: ["$likes", []] } },
              { $divide: [1, { $add: [{ $subtract: [new Date(), "$createdAt"] }, 1] }] }
            ]
          }
        }
      },
      { $sort: { algoScore: -1 } }, // ভাইরাল ভিডিও আগে আসবে
      { $limit: 20 } // পারফরম্যান্সের জন্য লিমিট
    ]);

    res.status(200).json(reels);
  } catch (err) {
    console.error("Neural Reels Fetch Error:", err);
    res.status(500).json({ msg: "Failed to fetch neural reels" });
  }
};

// ২. ভিডিও এনগেজমেন্ট পালস (ভিউর সংখ্যা বা স্কোর আপডেট করার জন্য)
export const updateReelPulse = async (req, res) => {
    try {
        const { id } = req.params;
        await Post.findByIdAndUpdate(id, { $inc: { views: 1 } });
        res.status(200).json({ msg: "Pulse updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ৩. রিলস আপলোড করার জন্য আলাদা ফাংশন
export const createReel = async (req, res) => {
  // এটি মূলত createPost এর মতোই কাজ করবে, শুধু postType 'reels' ফিক্সড থাকবে
  req.body.type = 'video';
  return createPost(req, res);
};
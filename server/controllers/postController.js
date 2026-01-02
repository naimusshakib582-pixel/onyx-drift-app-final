import { v2 as cloudinary } from 'cloudinary';
import Post from '../models/Post.js'; // নিশ্চিত করুন শেষে .js আছে

// Cloudinary কনফিগারেশন
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

export const createPost = async (req, res) => {
  try {
    const { content, type } = req.body; 
    let mediaUrl = "";
    let publicId = "";

    if (req.file) {
      const resourceType = type === 'photo' ? 'image' : 'video';
      
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        resource_type: resourceType,
        folder: "onyx_drift_media",
      });
      
      mediaUrl = uploadRes.secure_url;
      publicId = uploadRes.public_id;
    }

    const newPost = new Post({
      user: req.user.id,
      content,
      mediaUrl,
      mediaType: type || 'photo',
      publicId
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Neural Upload Failed" });
  }
};
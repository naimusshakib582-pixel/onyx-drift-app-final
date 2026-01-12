import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// ১. Cloudinary কনফিগারেশন
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ২. Cloudinary স্টোরেজ সেটআপ (Neural Storage Logic)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // ফাইল টাইপ অনুযায়ী রিসোর্স টাইপ সেট করা (ইমেজ, ভিডিও বা অডিও)
    let folderName = 'onyx_drift_uploads';
    let resourceType = 'auto'; // ইমেজ এবং ভিডিও অটো ডিটেক্ট করবে

    return {
      folder: folderName,
      resource_type: resourceType,
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'mp4', 'pdf', 'mp3', 'wav', 'ogg', 'm4a'],
      // অডিও ফাইলের জন্য বিশেষ সেটিংস (যদি প্রয়োজন হয়)
      transformation: file.mimetype.includes('audio') ? [{ bit_rate: "128k" }] : []
    };
  },
});

// ৩. Multer লিমিটেশন (বড় ফাইল প্রিভেন্ট করতে)
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // সর্বোচ্চ ৫০ এমবি ফাইল
});

/* ==========================================================
    🧠 NEURAL UPLOAD ENGINE
    Endpoint: POST /api/upload
    কাজ: ইমেজ, ভিডিও, অডিও বা পিডিএফ আপলোড করা
========================================================== */
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file detected in neural stream' });
    }

    // Cloudinary থেকে আসা ডাটা রেসপন্স
    res.json({ 
      success: true,
      msg: 'Data synchronized with Neural Cloud', 
      filePath: req.file.path, // সরাসরি https লিংক (চ্যাটে পাঠানোর জন্য)
      fileType: req.file.mimetype,
      public_id: req.file.filename,
      size: req.file.size
    });
  } catch (err) {
    console.error('Upload Process Failed:', err);
    res.status(500).json({ 
      msg: 'Neural Uplink Error', 
      error: err.message 
    });
  }
});

/* ==========================================================
    🗑️ DELETE FILE FROM CLOUD (Optional)
    Endpoint: DELETE /api/upload/:public_id
========================================================== */
router.delete('/:public_id', async (req, res) => {
  try {
    const { public_id } = req.params;
    await cloudinary.uploader.destroy(public_id);
    res.json({ msg: "File deleted from Neural Cloud" });
  } catch (err) {
    res.status(500).json({ msg: "Delete Failed" });
  }
});

export default router;
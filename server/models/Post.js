import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    // Auth0 'sub' আইডি স্টোর করবে (Data Integrity-র জন্য অত্যন্ত গুরুত্বপূর্ণ)
    author: { 
      type: String, 
      required: true, 
      index: true 
    }, 
    
    // ফ্রন্টএন্ড কুয়েরি এবং প্রোফাইল লিঙ্কের জন্য আইডি
    authorAuth0Id: { 
      type: String, 
      required: true, 
      index: true 
    }, 

    authorName: { type: String, default: "Drifter" },
    authorAvatar: { type: String, default: "" },
    text: { type: String, trim: true }, // শুধু টেক্সট পোস্টের জন্য এটি দরকারি
    
    // Cloudinary বা Storage URL
    media: { type: String, default: "" }, 
    
    mediaType: { 
      type: String, 
      // 🔥 'reel' যোগ করা হয়েছে যাতে কন্ট্রোলারের সাথে ম্যাচ করে এবং ৫০০ এরর না আসে
      enum: ['image', 'video', 'reel', 'text', 'none'], 
      default: 'none' 
    },
    
    // সোশ্যাল ইন্টারঅ্যাকশন (Auth0 IDs স্টোর হবে)
    likes: [{ type: String }], 
    
    comments: [
      {
        author: { type: String },
        authorName: { type: String },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    
    // ভাইরাল এনালিটিক্স ও র‍্যাঙ্কিং
    views: { type: Number, default: 0 }
  },
  { 
    timestamps: true // createdAt এবং updatedAt অটো তৈরি হবে
  }
);

/* ==========================================================
    🚀 OPTIMIZED INDEXING
========================================================== */
// ১. ইউজারের প্রোফাইল পেজে লেটেস্ট পোস্ট দ্রুত দেখানোর জন্য
postSchema.index({ authorAuth0Id: 1, createdAt: -1 });

// ২. ভাইরাল ফিড বা লেটেস্ট ফিড লোড করার জন্য
postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);
export default Post;
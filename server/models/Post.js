import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    // Auth0 ID একটি String, তাই এখানে String ব্যবহার করা হয়েছে
    author: { type: String, required: true }, 
    authorName: { type: String },
    authorAvatar: { type: String },
    text: { type: String },
    
    // মাল্টিমিডিয়া সেটিংস
    media: { type: String }, // Cloudinary বা Base64 URL
    mediaType: { 
      type: String, 
      enum: ['image', 'video', 'reel', 'text', 'none'], 
      default: 'none' 
    },
    
    // সোশাল ফিচারস (আইডিগুলো String হিসেবে থাকবে)
    likes: [{ type: String }],
    comments: [{
      author: { type: String },
      authorName: { type: String },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }],
    
    views: { type: Number, default: 0 }
  },
  { timestamps: true } // এটি স্বয়ংক্রিয়ভাবে createdAt এবং updatedAt তৈরি করবে
);

// ইন্ডেক্সিং (সার্চ ফাস্ট করার জন্য)
postSchema.index({ author: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);
export default Post;
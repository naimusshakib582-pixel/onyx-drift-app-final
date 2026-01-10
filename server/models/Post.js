import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    // এটি Auth0 'sub' আইডি স্টোর করবে
    author: { type: String, required: true }, 
    
    // ফ্রন্টএন্ড নেভিগেশনের জন্য এই ফিল্ডটি যোগ করা হলো
    authorAuth0Id: { type: String, required: true }, 

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
  { timestamps: true }
);

// ইন্ডেক্সিং (সার্চ এবং নেভিগেশন ফাস্ট করার জন্য)
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ authorAuth0Id: 1 }); // নতুন ইন্ডেক্স

const Post = mongoose.model('Post', postSchema);
export default Post;
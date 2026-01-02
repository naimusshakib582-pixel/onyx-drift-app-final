import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  replies: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String },
    
    // মাল্টিমিডিয়া সেটিংস
    media: { type: String }, // Cloudinary URL (Image/Video)
    mediaType: { 
      type: String, 
      enum: ['photo', 'video', 'reel', 'none'], 
      default: 'none' 
    },
    publicId: { type: String }, // Cloudinary থেকে ডিলিট করার জন্য প্রয়োজন হয়
    
    // সোশাল ফিচারস
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    
    // ভিউ কাউন্ট (ভিডিও বা রিলসের জন্য দরকারি)
    views: { type: Number, default: 0 }
  },
  { timestamps: true } // এটি স্বয়ংক্রিয়ভাবে createdAt এবং updatedAt তৈরি করবে
);

// ইন্ডেক্সিং (সার্চিং ফাস্ট করার জন্য)
postSchema.index({ author: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);
export default Post;
import mongoose from "mongoose";

const StorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  mediaUrl: { type: String, required: true },
  text: { type: String },
  musicName: { type: String },
  musicUrl: { type: String },
  filter: { type: String },
  // Boolean টাইপ ব্যবহার করা বেশি নিরাপদ
  onlyMessenger: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: { expires: '12h' } // ১২ ঘণ্টা পর অটো ডিলিট (TTL Index)
  }
}, { timestamps: true }); // এটি অতিরিক্ত ব্যাকআপ হিসেবে কাজ করবে

// দ্রুত সার্চ করার জন্য ইনডেক্সিং
StorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Story", StorySchema);
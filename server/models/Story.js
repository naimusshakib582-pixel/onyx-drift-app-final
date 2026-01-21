// models/Story.js

import mongoose from "mongoose";

const StorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  mediaUrl: { type: String, required: true },
  text: { type: String, default: "" },
  filter: { type: String, default: "None" },
  onlyMessenger: { type: Boolean, default: true },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 43200 // ১২ ঘণ্টা (১২ * ৬০ * ৬০ সেকেন্ড) সরাসরি সেকেন্ডে দিন
  }
}, { timestamps: true });

// ডুপ্লিকেট ইনডেক্স এড়াতে এটি ব্যবহার করুন
StorySchema.index({ userId: 1 });

export default mongoose.model("Story", StorySchema);
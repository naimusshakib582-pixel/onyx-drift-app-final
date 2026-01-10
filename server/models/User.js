import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // auth0Id কখনো পরিবর্তন হবে না (immutable: true)
    auth0Id: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true, 
      immutable: true 
    }, 
    
    // name একবারে সেট হবে, যা পরিবর্তন করা যাবে না (immutable: true)
    name: { 
      type: String, 
      required: true, 
      trim: true, 
      immutable: true 
    },
    
    nickname: { type: String, trim: true, unique: true, sparse: true }, 
    
    email: { 
      type: String, 
      unique: true, 
      lowercase: true, 
      sparse: true, 
      index: true 
    },
    
    avatar: { type: String, default: "" },
    coverImg: { type: String, default: "" }, 
    bio: { type: String, maxlength: 160 }, 
    location: { type: String, default: "" },
    workplace: { type: String, default: "" },
    
    isVerified: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false }, 
    ghostMode: { type: Boolean, default: false },
    antiScreenshot: { type: Boolean, default: false },
    neuralShieldActive: { type: Boolean, default: true },
    
    activeNodes: [
      {
        deviceId: String,
        deviceName: String,
        location: String,
        lastActive: { type: Date, default: Date.now }
      }
    ],

    /**
     * স্কেলিং টিপ: ১০০ মিলিয়ন ইউজারের জন্য আলাদা কালেকশন (Social Graph) 
     * ব্যবহার করা সবচেয়ে ভালো। তবে আপাতত পারফরম্যান্সের জন্য ইনডেক্স ব্যবহার করছি।
     */
    followers: [{ type: String, index: true }], 
    following: [{ type: String, index: true }],
    friends: [{ type: String }],
    pendingRequests: [{ type: String }], 
  },
  { timestamps: true }
);

/* ==========================================================
    🚀 CRITICAL INDEXING FOR 100M USERS
========================================================== */

// ১. টেক্সট ইনডেক্স (গ্লোবাল সার্চ ফাস্ট করার জন্য)
userSchema.index({ name: 'text', nickname: 'text' });

// ২. কম্পাউন্ড ইনডেক্স (নাম দিয়ে সার্চ করে ভেরিফাইড ইউজার আগে দেখানোর জন্য)
userSchema.index({ name: 1, isVerified: -1 });

// ৩. অটোমেটিক ইনডেক্সিং (সার্চ পারফরম্যান্স বাড়াতে)
userSchema.index({ auth0Id: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
export default User;
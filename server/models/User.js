import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    auth0Id: { 
      type: String, 
      required: true, 
      unique: true, 
      immutable: true 
    }, 
    name: { 
      type: String, 
      required: true, 
      trim: true, 
    },
    nickname: { 
      type: String, 
      trim: true, 
      unique: true, 
      sparse: true 
    },
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
    
    // 🏆 CREATOR & VERIFICATION
    isVerified: { type: Boolean, default: false },
    isCreator: { type: Boolean, default: false }, 
    isPremium: { type: Boolean, default: false }, 
    creatorLevel: { type: Number, default: 1 }, 

    // 🚀 STEP 10: VIRAL GROWTH & RANKING (নতুন যোগ করা হয়েছে)
    inviteCode: { 
      type: String, 
      unique: true, 
      sparse: true,
      index: true 
    }, // ইউজারের নিজস্ব ইনভাইট কোড
    referredBy: { 
      type: String, 
      default: null,
      index: true 
    }, // কে তাকে ইনভাইট করেছে (Auth0 ID)
    inviteCount: { 
      type: Number, 
      default: 0 
    }, // সে কতজনকে ইনভাইট করেছে
    isGenesisMember: { 
      type: Boolean, 
      default: false 
    }, // প্রথম ১০০০০ ইউজারের জন্য স্পেশাল ব্যাজ
    neuralRank: { 
      type: String, 
      enum: ["Neophyte", "Voyager", "Zenith", "Overlord"], 
      default: "Neophyte" 
    }, // গ্যামিফাইড র‍্যাঙ্কিং সিস্টেম

    // 💰 REVENUE & ANALYTICS
    revenueWallet: { type: Number, default: 0 }, 
    totalImpressions: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },

    // 🛡 NEURAL & PRIVACY
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

    // 📡 CONNECTIONS
    followers: [{ type: String, index: true }], 
    following: [{ type: String, index: true }],
    friends: [{ type: String }],
    blockedUsers: [{ type: String }], 
    pendingRequests: [{ type: String }], 
  },
  { timestamps: true }
);

/* ==========================================================
    🚀 OPTIMIZED INDEXING (Search & Ranking)
========================================================== */
// গ্লোবাল সার্চ ফাস্ট করার জন্য টেক্সট ইনডেক্স
userSchema.index({ name: 'text', nickname: 'text', bio: 'text' });

// ভাইরাল রিচ এবং ইনভাইট সিস্টেম ফাস্ট করার জন্য ইনডেক্স
userSchema.index({ createdAt: -1, isVerified: -1 });
userSchema.index({ inviteCode: 1 });
userSchema.index({ inviteCount: -1 }); // লিডারবোর্ডের জন্য

const User = mongoose.model("User", userSchema);
export default User;
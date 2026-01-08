import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    auth0Id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      unique: true, 
      lowercase: true, 
      sparse: true, 
      required: false 
    },
    avatar: { type: String, default: "" },
    coverImg: { type: String, default: "" }, 
    bio: { type: String, default: "" },
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

    // ফলো এবং ফ্রেন্ড সিস্টেম
    followers: [{ type: String }], 
    following: [{ type: String }],
    friends: [{ type: String }],
    pendingRequests: [{ type: String }], 
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
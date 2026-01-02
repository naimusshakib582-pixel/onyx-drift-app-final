import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String, default: "" },
    
    // --- Unique Security Features ---
    ghostMode: { type: Boolean, default: false }, // সার্চে প্রোফাইল হাইড করবে
    antiScreenshot: { type: Boolean, default: false }, // স্ক্রিনশট ব্লক সিগন্যাল
    neuralShieldActive: { type: Boolean, default: true },
    
    // ডিভাইস ট্র্যাকিং লজিক
    activeNodes: [
      {
        deviceId: String,
        deviceName: String,
        location: String,
        lastActive: { type: Date, default: Date.now }
      }
    ],

    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
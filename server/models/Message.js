import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    // ১. কন্টিনজেন্সি: এটি ওয়ান-টু-ওয়ান চ্যাট নাকি কমিউনিটি চ্যাট?
    conversationId: {
      type: String, // ওয়ান-টু-ওয়ান চ্যাটের জন্য (যেমন: senderId + receiverId)
      index: true
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      default: null, // যদি এটি কোনো গ্রুপ বা নোড চ্যাট হয়
      index: true
    },

    // ২. সেন্ডার ডিটেইলস (Fast UI Rendering এর জন্য ডেনরমালাইজড ডাটা)
    senderId: {
      type: String, // Auth0 ID
      required: true,
      index: true
    },
    senderName: { type: String },
    senderAvatar: { type: String },

    // ৩. কন্টেন্ট টাইপস
    text: {
      type: String,
      trim: true
    },
    media: {
      type: String, // Cloudinary URL (Image/Video/Voice Note)
      default: ""
    },
    mediaType: {
      type: String,
      enum: ["text", "image", "video", "voice", "file"],
      default: "text"
    },

    // ৪. রিড রিসিপ্ট এবং রিয়েল-টাইম স্ট্যাটাস
    seenBy: [
      {
        userId: String,
        seenAt: { type: Date, default: Date.now }
      }
    ],
    isEdited: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true, // এটি createdAt এবং updatedAt অটোমেটিক হ্যান্ডেল করবে
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/* ==========================================================
    🚀 PERFORMANCE OPTIMIZATION (Indexing)
========================================================== */
// লেটেস্ট মেসেজ দ্রুত লোড করার জন্য কম্পাউন্ড ইনডেক্স
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ communityId: 1, createdAt: -1 });

export default mongoose.model("Message", MessageSchema);
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipientId: { type: String, required: true }, // কাকে পাঠানো হচ্ছে
    senderName: { type: String, required: true },  // কে পাঠিয়েছে
    type: { type: String, enum: ['like', 'comment', 'follow', 'referral'], required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Notification", notificationSchema);
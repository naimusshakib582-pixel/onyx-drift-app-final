// src/models/post.js
import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    // user রেফারেন্স করছে 'User' মডেলকে (বড় হাতের 'U')
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    content: { type: String, required: true, trim: true },
    imageUrl: { type: String },
    // likes অ্যারেও 'User' মডেলকে রেফারেন্স করছে
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    commentsCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// ✅ মঙ্গুজ মডেলের নাম বড় হাতের 'Post' ব্যবহার করা হলো, 
// যা কালেকশনকে 'posts' নামে সেভ করবে।
export default mongoose.model('Post', PostSchema);
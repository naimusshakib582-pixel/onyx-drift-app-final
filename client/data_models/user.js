// src/models/user.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true }, // Google Login এর জন্য
    displayName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, select: false }, // পাসওয়ার্ড ডিফল্টভাবে দেখাবে না
    profilePicture: { type: String, default: 'default.jpg' },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', UserSchema);
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Redis from "ioredis"; 
import { v2 as cloudinary } from 'cloudinary';
import mongoose from "mongoose";

// ১. কনফিগারেশন লোড
dotenv.config();

// ২. ডাটাবেস ও রাুট ইম্পোর্ট
import connectDB from "./config/db.js"; 
import User from "./models/User.js"; 
import Post from "./models/Post.js"; 
import Notification from "./models/Notification.js"; 
import Message from "./models/Message.js"; // মেসেজ মডেলটি ইম্পোর্ট করো

// রাুট ফাইলগুলো
import profileRoutes from "./src/routes/profile.js"; 
import postRoutes from "./routes/posts.js";
import userRoutes from './routes/users.js'; 
import messageRoutes from "./routes/messages.js";         
import uploadRoutes from './routes/upload.js';
import communityRoutes from "./routes/communities.js";

const app = express();
const server = http.createServer(app);

// ৩. সকেট আইও ডিক্লেয়ারেশন (এটি তোমার কোডে মিসিং ছিল)
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://onyx-drift-app-final.onrender.com"],
        methods: ["GET", "POST"]
    }
});

// ৪. Cloudinary কনফিগারেশন
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// ৫. Redis কানেকশন
const REDIS_URL = process.env.REDIS_URL;
let redis;
if (REDIS_URL) {
    redis = new Redis(REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy: (times) => Math.min(times * 50, 2000),
    });
    redis.on("connect", () => console.log("✅ Neural Cache (Redis) Connected"));
}

// AI, Middleware, Database Connection (তোমার আগের কোড অনুযায়ী ঠিক আছে...)
connectDB();
app.use(cors({ credentials: true, origin: true }));
app.use(express.json({ limit: "50mb" }));

// রাুট মাউন্টিং
app.use("/api/user", userRoutes); 
app.use("/api/profile", profileRoutes); 
app.use("/api/posts", postRoutes); 
app.use("/api/messages", messageRoutes); 

/* ==========================================================
    📡 REAL-TIME ENGINE (Typing, Seen, Delete Added)
========================================================== */
io.on("connection", (socket) => {
    
    // অনলাইন ইউজার ট্র্যাকিং
    socket.on("addNewUser", async (userId) => {
        if (redis) {
            await redis.hset("online_users", userId, socket.id);
            const allUsers = await redis.hgetall("online_users");
            io.emit("getOnlineUsers", Object.keys(allUsers).map(id => ({ userId: id })));
        }
    });

    // ১. মেসেজ পাঠানো
    socket.on("sendMessage", async (data) => {
        const { receiverId } = data;
        const socketId = await redis?.hget("online_users", receiverId);
        if (socketId) io.to(socketId).emit("getMessage", data);
    });

    // ২. টাইপিং ইন্ডিকেটর (New)
    socket.on("typing", async ({ receiverId, senderId }) => {
        const socketId = await redis?.hget("online_users", receiverId);
        if (socketId) io.to(socketId).emit("displayTyping", { senderId });
    });

    socket.on("stopTyping", async ({ receiverId }) => {
        const socketId = await redis?.hget("online_users", receiverId);
        if (socketId) io.to(socketId).emit("hideTyping");
    });

    // ৩. ব্লু টিক / মেসেজ সিন (New)
    socket.on("messageSeen", async ({ messageId, senderId, receiverId }) => {
        try {
            // DB আপডেট (Message মডেল অনুযায়ী)
            await Message.findByIdAndUpdate(messageId, { seen: true });
            const socketId = await redis?.hget("online_users", senderId);
            if (socketId) io.to(socketId).emit("messageSeenUpdate", { messageId });
        } catch (err) { console.log(err); }
    });

    // ৪. মেসেজ ডিলিট (New)
    socket.on("deleteMessage", async ({ messageId, receiverId }) => {
        const socketId = await redis?.hget("online_users", receiverId);
        if (socketId) io.to(socketId).emit("messageDeleted", messageId);
    });

    // ৫. কল লজিক
    socket.on("callUser", ({ userToCall, from, fromName, type, roomId }) => {
        redis?.hget("online_users", userToCall).then((socketId) => {
            if (socketId) io.to(socketId).emit("incomingCall", { from, fromName, type, roomId });
        });
    });

    socket.on("disconnect", async () => {
        if (redis) {
            const all = await redis.hgetall("online_users");
            for (const [uId, sId] of Object.entries(all)) {
                if (sId === socket.id) {
                    await redis.hdel("online_users", uId);
                    const updated = await redis.hgetall("online_users");
                    io.emit("getOnlineUsers", Object.keys(updated).map(id => ({ userId: id })));
                    break;
                }
            }
        }
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => console.log(`🚀 OnyxDrift Core Online: ${PORT}`));
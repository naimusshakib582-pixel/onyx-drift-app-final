import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose"; 
import { GoogleGenerativeAI } from "@google/generative-ai";
import Redis from "ioredis"; 
import { v2 as cloudinary } from 'cloudinary';

// ১. কনফিগারেশন লোড
dotenv.config();

// ২. ডাটাবেস ও রাউট ইম্পোর্ট
import connectDB from "./config/db.js"; 
import profileRoutes from "./src/routes/profile.js"; 
import postRoutes from "./routes/posts.js";
import usersRoutes from './routes/users.js'; 
import messageRoutes from "./routes/messages.js";   

const app = express();
const server = http.createServer(app);

// ৩. Cloudinary কনফিগারেশন
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// ৪. Redis কানেকশন (টুইটার স্পিডের জন্য দুটি কানেকশন দরকার)
const REDIS_URL = process.env.REDIS_URL || "redis://default:vrf4EFLABBRLQ65e02TISHLbzC3kGiCH@redis-16125.c10.us-east-1-4.ec2.cloud.redislabs.com:16125";

const redis = new Redis(REDIS_URL); // সাধারণ ডাটা স্টোরেজ এর জন্য
const redisSub = new Redis(REDIS_URL); // Java থেকে আসা মেসেজ শোনার জন্য (Subscriber)

redis.on("connect", () => console.log("🚀 System: Redis Main Client Connected."));
redisSub.on("connect", () => console.log("🔥 System: Redis Subscriber (Neural Link) Connected."));

// ৫. AI কনফিগারেশন
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ৬. CORS কনফিগারেশন (Vercel ডোমেইন মাস্ট)
const allowedOrigins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173", 
    "https://onyx-drift-app-final.onrender.com",
    "https://onyx-drift.com",
    "https://onyx-drift.vercel.app" // আপনার ভেরসেল লিঙ্ক
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS Access Denied"));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: "50mb" }));

// ৭. এপিআই এন্ডপয়েন্টস
connectDB();
app.use("/api/profile", profileRoutes);
app.use("/api/user", usersRoutes); 
app.use("/api/posts", postRoutes); 
if (messageRoutes) app.use("/api/messages", messageRoutes);

// Media Upload Logic
app.post("/api/upload", async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ error: "No image provided" });
        const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: "onyx_drift_posts",
            resource_type: "auto"
        });
        res.json({ url: uploadResponse.secure_url, public_id: uploadResponse.public_id });
    } catch (error) {
        res.status(500).json({ error: "Upload failed" });
    }
});

// AI Enhance Route
app.post("/api/ai/enhance", async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`You are OnyxDrift AI. Aesthetic rewrite for social media post: "${prompt}"`);
    res.json({ enhancedText: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: "AI Error" });
  }
});

app.get("/", (req, res) => res.send("✅ OnyxDrift Neural Server Online"));

// ৮. সকেট ও রিয়েল-টাইম লজিক (Twitter-style Fan-out)
const io = new Server(server, {
  cors: { 
    origin: allowedOrigins,
    credentials: true
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true
});

// 🔥 Java থেকে আসা মেসেজ সরাসরি সকেটে পাঠানো (Neural Link)
redisSub.subscribe("tweet-channel", (err) => {
    if (err) console.error("❌ Redis Sub Error:", err);
});

redisSub.on("message", (channel, message) => {
    if (channel === "tweet-channel") {
        const postData = JSON.parse(message);
        io.emit("receiveNewPost", postData); // সরাসরি সব ইউজারকে ব্রডকাস্ট
        console.log("🚀 High-speed broadcast sent to clients");
    }
});

io.on("connection", (socket) => {
  console.log(`📡 Node Connected: ${socket.id}`);

  socket.on("addNewUser", async (userId) => {
    if (userId) {
      await redis.hset("online_users", userId, socket.id);
      const onlineUsers = await redis.hgetall("online_users");
      io.emit("getOnlineUsers", Object.keys(onlineUsers).map(id => ({ userId: id, socketId: onlineUsers[id] })));
    }
  });

  socket.on("disconnect", async () => {
    const onlineUsers = await redis.hgetall("online_users");
    for (const [userId, socketId] of Object.entries(onlineUsers)) {
        if (socketId === socket.id) {
            await redis.hdel("online_users", userId);
            break;
        }
    }
    const updatedUsers = await redis.hgetall("online_users");
    io.emit("getOnlineUsers", Object.keys(updatedUsers).map(id => ({ userId: id, socketId: updatedUsers[id] })));
  });
});

// ৯. সার্ভার স্টার্ট
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`🚀 System Active on Port: ${PORT}`));
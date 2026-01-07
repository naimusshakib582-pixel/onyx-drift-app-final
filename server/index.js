import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose"; 
import { GoogleGenerativeAI } from "@google/generative-ai";
import Redis from "ioredis"; 
import { v2 as cloudinary } from 'cloudinary'; // ক্লাউডিনারি ইম্পোর্ট

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

// ৩. Cloudinary কনফিগারেশন (Media Storage)
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// ৪. Redis Cloud কানেকশন (Caching System)
const redis = new Redis("redis://default:vrf4EFLABBRLQ65e02TISHLbzC3kGiCH@redis-16125.c10.us-east-1-4.ec2.cloud.redislabs.com:16125");

redis.on("connect", () => {
    console.log("🚀 System: Redis Cloud Neural Cache Connected.");
});

// ৫. AI কনফিগারেশন
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ৬. মিডলওয়্যার ও CORS ফিক্স
const allowedOrigins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173", 
    "https://onyx-drift-app-final.onrender.com",
    "https://onyx-drift.com"
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

app.use(express.json({ limit: "50mb" })); // বড় ইমেজ হ্যান্ডেল করার জন্য লিমিট বাড়ানো হয়েছে

// ৭. এপিআই এন্ডপয়েন্টস
connectDB();
app.use("/api/profile", profileRoutes);
app.use("/api/user", usersRoutes); 
app.use("/api/posts", postRoutes); 
if (messageRoutes) app.use("/api/messages", messageRoutes);

// --- 📸 Priority #2: Direct Media Upload Logic ---
app.post("/api/upload", async (req, res) => {
    try {
        const { image } = req.body; // Base64 string from frontend
        if (!image) return res.status(400).json({ error: "No image provided" });

        const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: "onyx_drift_posts",
            resource_type: "auto"
        });

        res.json({ url: uploadResponse.secure_url, public_id: uploadResponse.public_id });
        console.log("✅ Media Uploaded to Cloudinary");
    } catch (error) {
        console.error("❌ Cloudinary Error:", error);
        res.status(500).json({ error: "Upload failed" });
    }
});

// --- ⚡ Priority #1: Cache-First Feed ---
app.get("/api/feed/:userId", async (req, res) => {
    const { userId } = req.params;
    const cacheKey = `feed:${userId}`;

    try {
        const cachedFeed = await redis.get(cacheKey);
        if (cachedFeed) {
            console.log("⚡ Cache Hit: Instant Feed Delivery");
            return res.json(JSON.parse(cachedFeed));
        }
        res.json({ message: "DB Logic will be here" });
    } catch (err) {
        res.status(500).json({ error: "Neural Link Feed Error" });
    }
});

// AI Enhance Route
app.post("/api/ai/enhance", async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const fullPrompt = `You are OnyxDrift AI. Aesthetic rewrite: "${prompt}"`;
    const result = await model.generateContent(fullPrompt);
    res.json({ enhancedText: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: "AI Error" });
  }
});

app.get("/", (req, res) => res.send("✅ OnyxDrift Neural Server Online"));

// ৮. সকেট লজিক (Priority #6)
const io = new Server(server, {
  cors: { origin: allowedOrigins },
  transports: ['websocket', 'polling']
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
  });
});

// ৯. সার্ভার স্টার্ট
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`🚀 System Active on Port: ${PORT}`));
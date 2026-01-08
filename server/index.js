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

// ৪. Redis কানেকশন
let REDIS_URL = process.env.REDIS_URL || "redis://default:vrf4EFLABBRLQ65e02TISHLbzC3kGiCH@redis-16125.c10.us-east-1-4.ec2.cloud.redislabs.com:16125";

if (!REDIS_URL.startsWith("redis://") && !REDIS_URL.startsWith("rediss://")) {
    REDIS_URL = `redis://${REDIS_URL}`;
}

const redisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => Math.min(times * 50, 2000),
};

const redis = new Redis(REDIS_URL, redisOptions); 
const redisSub = new Redis(REDIS_URL, redisOptions); 

redis.on("connect", () => console.log("🚀 System: Redis Main Client Connected."));
redisSub.on("connect", () => console.log("🔥 System: Redis Subscriber Connected."));

// ৫. AI কনফিগারেশন
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ৬. CORS কনফিগারেশন (আপনার ডোমেইন সহ পূর্ণাঙ্গ লিস্ট)
const allowedOrigins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173", 
    "https://onyx-drift-app-final.onrender.com",
    "https://onyxdrift.onrender.com",
    "https://www.onyx-drift.com", // প্রধান ডোমেইন
    "https://onyx-drift.com"      // নন-ডব্লিউডব্লিউডব্লিউ ভার্সন
];

app.use(cors({
    origin: function (origin, callback) {
        // origin না থাকলে (যেমন মোবাইল অ্যাপ/পোস্টম্যান) অথবা লিস্টে থাকলে এলাউ করবে
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("❌ Blocked by CORS:", origin);
            callback(new Error("CORS Access Denied"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"] // টোকেন ভেরিফিকেশনের জন্য এটি বাধ্যতামূলক
}));

app.use(express.json({ limit: "50mb" }));

// ৭. এপিআই এন্ডপয়েন্টস
connectDB();
app.use("/api/profile", profileRoutes);
app.use("/api/user", usersRoutes); 
app.use("/api/posts", postRoutes); 
if (messageRoutes) app.use("/api/messages", messageRoutes);

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

// ৮. সকেট ও রিয়েল-টাইম লজিক (CORS Fix)
const io = new Server(server, {
  cors: { 
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  path: "/socket.io/"
});

// Redis Pub/Sub Logic
redisSub.subscribe("tweet-channel", (err, count) => {
    if (!err) console.log(`📡 Subscribed to ${count} channels. Listening for Java signals...`);
});

redisSub.on("message", (channel, message) => {
    if (channel === "tweet-channel") {
        try {
            const postData = JSON.parse(message);
            io.emit("receiveNewPost", postData); 
            console.log("🚀 High-speed broadcast: New post delivered to clients");
        } catch (e) {
            console.error("❌ Error parsing Redis message:", e);
        }
    }
});

io.on("connection", (socket) => {
  console.log(`📡 Node Connected: ${socket.id}`);

  socket.on("addNewUser", async (userId) => {
    try {
        if (userId) {
          await redis.hset("online_users", userId, socket.id);
          const onlineUsers = await redis.hgetall("online_users");
          io.emit("getOnlineUsers", Object.keys(onlineUsers).map(id => ({ userId: id, socketId: onlineUsers[id] })));
        }
    } catch (err) {
        console.error("Socket AddUser Error:", err);
    }
  });

  socket.on("disconnect", async () => {
    try {
        const onlineUsers = await redis.hgetall("online_users");
        for (const [userId, socketId] of Object.entries(onlineUsers)) {
            if (socketId === socket.id) {
                await redis.hdel("online_users", userId);
                break;
            }
        }
        const updatedUsers = await redis.hgetall("online_users");
        io.emit("getOnlineUsers", Object.keys(updatedUsers).map(id => ({ userId: id, socketId: updatedUsers[id] })));
        console.log(`🔌 Node Disconnected: ${socket.id}`);
    } catch (err) {
        console.error("Socket Disconnect Error:", err);
    }
  });
});

// ৯. সার্ভার স্টার্ট
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 System Active on Port: ${PORT}`);
});
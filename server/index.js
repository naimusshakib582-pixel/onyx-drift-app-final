import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import Redis from "ioredis"; 
import { v2 as cloudinary } from 'cloudinary';
import axios from "axios"; 

// ১. কনফিগারেশন ও ডাটাবেস কানেকশন
dotenv.config();
import connectDB from "./config/db.js"; 
connectDB();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// ২. রাউট ইম্পোর্ট
import profileRoutes from "./src/routes/profile.js"; 
import postRoutes from "./routes/posts.js";
import userRoutes from './routes/users.js'; 
import messageRoutes from "./routes/messages.js";
import storyRoute from "./routes/stories.js";
import reelRoutes from "./routes/reels.js"; 

const app = express();
const server = http.createServer(app);

// ৩. CORS কনফিগারেশন
const allowedOrigins = [
    "http://localhost:5173", 
    "https://onyx-drift-app-final.onrender.com",
    "https://www.onyx-drift.com",
    "https://onyx-drift.com"
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Signal Blocked: CORS Security Policy'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ৪. সকেট আইও কনফিগারেশন
const io = new Server(server, {
    cors: corsOptions,
    transports: ['polling', 'websocket'], 
    allowEIO3: true, 
    pingTimeout: 60000,   
    pingInterval: 25000
});

// ৫. Redis Setup
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
}) : null;

// এপিআই রাউটস
app.use("/api/user", userRoutes); 
app.use("/api/profile", profileRoutes); 
app.use("/api/posts", postRoutes); 
app.use("/api/messages", messageRoutes); 
app.use("/api/stories", storyRoute);
app.use("/api/reels", reelRoutes); 

app.get("/", (req, res) => res.send("🚀 OnyxDrift Neural Core is Online!"));

/* ==========================================================
    📡 REAL-TIME ENGINE (Socket.io) - Group & Video Added
========================================================== */
io.on("connection", (socket) => {
    
    // ১. ইউজার অনলাইন হ্যান্ডলিং
    socket.on("addNewUser", async (userId) => {
        if (!userId) return;
        socket.join(userId); // ব্যক্তিগত রুম (DM এর জন্য)
        if (redis) {
            await redis.hset("online_users", userId, socket.id);
            const allUsers = await redis.hgetall("online_users");
            io.emit("getOnlineUsers", Object.keys(allUsers).map(id => ({ userId: id })));
        }
    });

    // ২. স্মার্ট মেসেজিং (প্রাইভেট ও গ্রুপ)
    socket.on("sendMessage", async (data) => {
        const { receiverId, isGroup, members, conversationId } = data;

        if (isGroup && members) {
            // গ্রুপের প্রতিটি মেম্বারকে মেসেজ পাঠানো (নিজে বাদে)
            members.forEach(memberId => {
                if (memberId !== data.senderId) {
                    io.to(memberId).emit("getMessage", data);
                }
            });
        } else if (receiverId) {
            // প্রাইভেট মেসেজ
            io.to(receiverId).emit("getMessage", data);
        }
    });

    // ৩. টাইপিং ইন্ডিকেটর
    socket.on("typing", (data) => {
        if (data.isGroup && data.members) {
            data.members.forEach(mId => {
                if (mId !== data.senderId) io.to(mId).emit("displayTyping", data);
            });
        } else {
            io.to(data.receiverId).emit("displayTyping", data);
        }
    });

    // ৪. গ্রুপ ভিডিও কল সিগন্যালিং
    socket.on("startGroupCall", (data) => {
        const { participants, roomId, senderName, type } = data;
        // গ্রুপের সবাইকে ইনকামিং কল সিগন্যাল পাঠানো
        participants.forEach(userId => {
            io.to(userId).emit("incomingGroupCall", {
                roomId,
                senderName,
                type,
                isGroup: true
            });
        });
    });

    // ৫. একক কল সিগন্যালিং (WebRTC Signaling)
    socket.on("callUser", (data) => {
        io.to(data.userToCall).emit("incomingCall", {
            signal: data.signalData,
            from: data.from,
            name: data.senderName,
            type: data.type,
            roomId: data.roomId
        });
    });

    socket.on("answerCall", (data) => {
        io.to(data.to).emit("callAccepted", data.signal);
    });

    // ৬. ডিসকানেক্ট হ্যান্ডলিং
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
server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Core Active on Port: ${PORT}`));
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import http from "http"; 
import { Server } from "socket.io"; 
import profileRoutes from "./src/routes/profile.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildPath = path.join(__dirname, "../client/build"); // dist এর জায়গায় build থাকলে এটি দিন
const app = express();

// --- ১. HTTP সার্ভার এবং সকেট সেটআপ ---
const server = http.createServer(app); 
const io = new Server(server, {
    cors: {
        origin: [
            "https://www.onyx-drift.com",
            "https://onyx-drift.com",
            "http://localhost:5173",
            "https://onyx-drift-app-final.onrender.com"
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// অনলাইন ইউজার ট্র্যাক করার জন্য স্টোরেজ
let onlineUsers = [];

const addUser = (userId, socketId) => {
    if (userId && !onlineUsers.some((user) => user.userId === userId)) {
        onlineUsers.push({ userId, socketId });
    }
};

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return onlineUsers.find((user) => user.userId === userId);
};

// --- ২. সকেট কানেকশন লজিক (Real-time & Video Call) ---
io.on("connection", (socket) => {
    console.log("Connected to Socket.io:", socket.id);

    // ইউজার অনলাইন হলে
    socket.on("addNewUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("getOnlineUsers", onlineUsers);
    });

    // ১-টু-১ মেসেজ পাঠানো
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        if (user) {
            io.to(user.socketId).emit("getMessage", { senderId, text });
        }
    });

    // ভিডিও কল ইনভাইট পাঠানো
    socket.on("sendCallInvite", ({ senderName, roomId, receiverId }) => {
        const user = getUser(receiverId);
        if (user) {
            console.log(`Sending call invite to: ${receiverId}`);
            io.to(user.socketId).emit("incomingCall", { senderName, roomId });
        }
    });

    // কল রিজেক্ট করা
    socket.on("rejectCall", ({ receiverId }) => {
        const user = getUser(receiverId);
        if (user) {
            io.to(user.socketId).emit("callRejected");
        }
    });

    // ডিসকানেক্ট হ্যান্ডলিং
    socket.on("disconnect", () => {
        removeUser(socket.id);
        io.emit("getOnlineUsers", onlineUsers);
        console.log("User disconnected:", socket.id);
    });
});

// --- ৩. মিডলওয়্যার ও সিকিউরিটি ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());

const allowedOrigins = [
    'https://www.onyx-drift.com',
    'https://onyx-drift.com',
    'https://onyx-drift-app-final.onrender.com',
    'http://localhost:5173'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later."
});
app.use("/api/", limiter);

// --- ৪. Routes ---
app.use("/api/profile", profileRoutes);

// --- ৫. Static Files (Frontend Build) ---
const buildPath = path.join(__dirname, "../client/dist");
app.use(express.static(buildPath));

app.get("*", (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(buildPath, "index.html"));
    }
});

// --- ৬. সার্ভার স্টার্ট ---
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server & Socket running on port ${PORT}`);
});
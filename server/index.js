import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

// ১. সবার আগে dotenv কনফিগার করুন (যাতে connectDB কল হওয়ার আগেই ভ্যারিয়েবল লোড হয়)
dotenv.config();

// ২. ডাটাবেস ও রাউট ইম্পোর্ট (অবশ্যই dotenv.config() এর নিচে)
import connectDB from "./config/db.js"; 
import profileRoutes from "./src/routes/profile.js"; 
import userRoutes from "./routes/userRoutes.js";    
import postRoutes from "./routes/posts.js";        
import messageRoutes from "./routes/messages.js";

const app = express();

// ৩. মিডেলওয়্যার সেটআপ (CORS প্রোডাকশন ইউআরএল সহ)
app.use(cors({
    origin: [
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "https://onyx-drift-app-final.onrender.com" // আপনার Render ফ্রন্টএন্ড ইউআরএল এখানে যোগ করুন
    ],
    credentials: true
}));
app.use(express.json());

// ৪. HTTP Server তৈরি
const server = http.createServer(app);

// ৫. Socket.io কনফিগারেশন
const io = new Server(server, {
  cors: {
    origin: [
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "https://onyx-drift-app-final.onrender.com" // সকেটের জন্যও ইউআরএলটি দিন
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"]
});

// ৬. ডাটাবেস কানেক্ট (এটি এখন সঠিকভাবে MONGODB_URI খুঁজে পাবে)
connectDB();

// ৭. এপিআই রাউটস মাউন্ট করা
app.use("/api/profile", profileRoutes);
app.use("/api/user", userRoutes); 
app.use("/api/posts", postRoutes);

// মেসেজ রাউট মাউন্ট
if (messageRoutes) {
    app.use("/api/messages", messageRoutes);
}

// Watch পেজের জন্য সাময়িক রাউট
app.get("/api/watch", (req, res) => {
    res.json([]); 
});

app.get("/", (req, res) => res.send("✅ OnyxDrift API is running successfully..."));

// --- সকেট লজিক (অনলাইন ইউজার ট্র্যাকিং) ---
let onlineUsers = []; 

io.on("connection", (socket) => {
  console.log("🚀 New Connection:", socket.id);

  socket.on("addNewUser", (userId) => {
    if (!userId) return;
    // ডুপ্লিকেট ইউজার রিমুভ করা
    onlineUsers = onlineUsers.filter((u) => u.userId !== userId);
    onlineUsers.push({ userId, socketId: socket.id });
    console.log("👥 Online Users Updated:", onlineUsers.length);
    io.emit("getOnlineUsers", onlineUsers);
  });

  socket.on("sendNotification", ({ senderName, receiverId, type, image }) => {
    const receiver = onlineUsers.find((u) => u.userId === receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("getNotification", {
        senderName,
        type,
        image,
        createdAt: new Date(),
      });
    }
  });

  socket.on("sendMessage", (message) => {
    const receiver = onlineUsers.find((u) => u.userId === message.receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", message);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);
    console.log("❌ User disconnected");
  });
});

// ৮. সার্ভার স্টার্ট
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`\n============================================`);
  console.log(`✅ OnyxDrift Server is Live on Port ${PORT}`);
  console.log(`============================================\n`);
});
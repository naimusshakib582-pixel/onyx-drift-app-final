import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; 
import profileRoutes from "./routes/profile.js";
import messageRoutes from "./routes/messages.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js"; // ১. নতুন পোস্ট রাউট ইম্পোর্ট

dotenv.config();

const app = express();

// মিডলওয়্যার কনফিগারেশন
app.use(cors({
  origin: ["http://localhost:5173", "https://your-live-site.com"], // ফ্রন্টএন্ডের জন্য নির্দিষ্ট করা ভালো
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ২. স্ট্যাটিক ফোল্ডার (যদি লোকাল ফাইল সার্ভ করতে চান, তবে ক্লাউডিনারি থাকলে দরকার নেই)
app.use("/uploads", express.static("uploads"));

// HTTP Server তৈরি
const server = http.createServer(app);

// Socket.io কনফিগারেশন
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://your-live-site.com"],
    methods: ["GET", "POST"],
  },
});

// ডাটাবেস কানেক্ট
connectDB();

// --- রাউট মাউন্ট করা ---
app.get("/", (req, res) => res.send("✅ OnyxDrift Neural API is Synchronized"));

app.use("/api/profile", profileRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes); // ৩. পোস্ট এপিআই কানেক্ট করা হলো (/api/posts/create)
if (messageRoutes) app.use("/api/messages", messageRoutes);

// --- সকেট লজিক (রিয়েল-টাইম ফিচার) ---
let onlineUsers = [];

io.on("connection", (socket) => {
  // ইউজার রেজিস্টার করা
  socket.on("addNewUser", (userId) => {
    onlineUsers = onlineUsers.filter((u) => u.userId !== userId);
    onlineUsers.push({ userId, socketId: socket.id });
    io.emit("getOnlineUsers", onlineUsers);
  });

  // রিয়েল-টাইম নোটিফিকেশন (Like, Comment, Post)
  socket.on("sendNotification", ({ senderName, receiverId, type, image }) => {
    const receiver = onlineUsers.find((u) => u.userId === receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("getNotification", {
        senderName, type, image, createdAt: new Date()
      });
    }
  });

  // চ্যাট মেসেজ
  socket.on("sendMessage", (message) => {
    const receiver = onlineUsers.find((u) => u.userId === message.receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", message);
    }
  });

  // ভিডিও কল ডিসকানেক্ট এবং অন্যান্য লজিক আগের মতোই থাকবে...
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  });
});

// সার্ভার স্টার্ট
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`
  🚀 NEURAL LINK ESTABLISHED
  📡 SERVER: http://localhost:${PORT}
  🌌 MODE: ONYX_DRIFT_CYBER_ENVIRONMENT
  `);
});
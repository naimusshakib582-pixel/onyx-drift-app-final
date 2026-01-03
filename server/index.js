import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Route Imports
import connectDB from "./config/db.js"; 
import profileRoutes from "./src/routes/profile.js"; 
import userRoutes from "./routes/userRoutes.js";      
import postRoutes from "./routes/posts.js";            
import messageRoutes from "./routes/messages.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ১. AI কনফিগারেশন
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ২. মিডলওয়্যার (CORS & JSON)
// এখানে আপনার ডোমেইনগুলো নিখুঁতভাবে সেট করা হয়েছে
const allowedOrigins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173", 
    "https://onyx-drift-app-final.onrender.com",
    "https://www.onyx-drift.com",
    "https://onyx-drift.com"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ৩. সকেট কনফিগারেশন (CORS ফিক্স সহ)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// ৪. ডাটাবেস কানেকশন
connectDB();

// ৫. এপিআই রাউটস
app.use("/api/profile", profileRoutes);
app.use("/api/user", userRoutes); 
app.use("/api/posts", postRoutes); 
if (messageRoutes) app.use("/api/messages", messageRoutes);

// --- AI Enhance Route ---
app.post("/api/ai/enhance", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "No text provided" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const fullPrompt = `You are the AI of a futuristic social media platform called OnyxDrift. 
    Rewrite the following user post to be more engaging, professional yet cool, and aesthetic. 
    Keep it concise (maximum 2-3 sentences) and add 2 relevant hashtags. 
    Original text: "${prompt}"`;

    const result = await model.generateContent(fullPrompt);
    const enhancedText = result.response.text();
    
    res.json({ enhancedText });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "AI processing failed" });
  }
});

// রেন্ডার সার্ভার যেন স্লিপ না করে তাই রুট চেক
app.get("/", (req, res) => res.send("✅ OnyxDrift Neural Server is online..."));

// ৬. সকেট লজিক
let onlineUsers = []; 

io.on("connection", (socket) => {
  console.log(`📡 New Drift Connection: ${socket.id}`);

  socket.on("addNewUser", (userId) => {
    if (userId && !onlineUsers.some(u => u.userId === userId)) {
      onlineUsers.push({ userId, socketId: socket.id });
    }
    io.emit("getOnlineUsers", onlineUsers);
    console.log("Current Online Users:", onlineUsers.length);
  });

  socket.on("sendNewPost", (newPost) => {
    io.emit("receiveNewPost", newPost);
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);
    console.log("❌ User disconnected from Neural Drift");
  });
});

// ৭. সার্ভার লিসেন
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`
  🚀-------------------------------------------------🚀
      OnyxDrift Server is Live on Port: ${PORT}
      Mode: Production
  🚀-------------------------------------------------🚀
  `);
});
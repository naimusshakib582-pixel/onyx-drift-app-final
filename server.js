

// 
// 1. IMPORTS & SETUP
// 

import express from "express";
import cors from "cors";
// Socket.IO-এর জন্য http এবং socket.io ইমপোর্ট করুন
import http from 'http';
import { Server } from 'socket.io'; 

const app = express();
// HTTP সার্ভার তৈরি করুন
const server = http.createServer(app); 
// Socket.IO সার্ভার তৈরি করুন
const io = new Server(server, {
  cors: {
    origin: "*", // ফ্রন্টএন্ড URL দিন, আপাতত "*"
    methods: ["GET", "POST"]
  }
});


// Middleware
app.use(cors());         
app.use(express.json()); 


// 2. DATABASE CONNECTION (Optional for now)
// ... (পরিবর্তন নেই)


// ---------------------------------------------
// Socket.IO সংযোগ (নতুন অংশ)
// ---------------------------------------------
io.on('connection', (socket) => {
  console.log('🔗 A user connected via Socket.IO');

  // এখানে আপনি আপনার Socket.IO ইভেন্টগুলো যোগ করতে পারেন
  // socket.on('sendMessage', (message) => { ... });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
  });
});


// ---------------------------------------------
// 3. BASIC HEALTH CHECK ROUTE
// ---------------------------------------------
app.get("/", (req, res) => {
  res.send("🔥 Server is running successfully!");
});


// ---------------------------------------------
// 4. LOGIN ROUTE (Dummy Authentication Logic)
// ---------------------------------------------
// ... (পরিবর্তন নেই)
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  // ... (বাকি লগইন লজিক)
});


// ---------------------------------------------
// 5. USERS ROUTE
// ---------------------------------------------
app.get("/api/users", (req, res) => {
  // ... (পরিবর্তন নেই)
});


// ---------------------------------------------
// 6. GET AUTH USER ROUTE (নতুন অংশ)
// ---------------------------------------------
app.get("/api/auth/me", (req, res) => {
    // এখানে আপনি অথেনটিকেটেড ইউজারকে তার টোকেন দিয়ে খুঁজে বের করার লজিক লিখবেন।
    // আপাতত ডামি ডেটা দেওয়া হলো, যা 404 ত্রুটি ঠিক করবে।
    const dummyUser = { 
        id: 99, 
        name: "Authenticated User", 
        email: "auth@example.com",
        avatar: "https://i.ibb.co/02YJnZn/avatar.png",
    };
    res.json({ success: true, user: dummyUser });
});


// ---------------------------------------------
// 7. SERVER LISTENING (IMPORTANT)
// ---------------------------------------------
const PORT = process.env.PORT || 5000;
// app.listen এর বদলে server.listen ব্যবহার করুন
server.listen(PORT, () => { 
  console.log(`🚀 Server running on port: ${PORT}`);
});

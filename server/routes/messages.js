import express from "express";
const router = express.Router();
import auth from "../middleware/auth.js"; 

// মডেল ইম্পোর্ট
import Conversation from "../models/Conversation.js"; 
import Message from "../models/Message.js";      

/* ==========================================================
   1️⃣ GET ALL CONVERSATIONS
   Route: GET /api/messages/conversations
========================================================== */
router.get("/conversations", auth, async (req, res) => {
  try {
    const currentUserId = req.user?.sub || req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ error: "Neural identity missing" });
    }

    // চ্যাট লিস্ট খুঁজে বের করা এবং লেটেস্ট চ্যাট সবার আগে রাখা
    const conversations = await Conversation.find({
      members: { $in: [currentUserId] },
    }).sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (err) {
    console.error("Conversation Fetch Error:", err);
    res.status(500).json({ error: "Could not sync conversations" });
  }
});

/* ==========================================================
   2️⃣ CREATE OR GET CONVERSATION (ব্যক্তিগত চ্যাট শুরু করা)
   Route: POST /api/messages/conversation
========================================================== */
router.post("/conversation", auth, async (req, res) => {
  const { receiverId } = req.body; // শুধুমাত্র receiverId পাঠালেই হবে
  const senderId = req.user?.sub || req.user?.id;

  if (!receiverId) return res.status(400).json({ error: "Receiver ID required" });

  try {
    // অলরেডি চ্যাট আছে কি না চেক করা
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        members: [senderId, receiverId],
      });
      await conversation.save();
    }

    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json({ error: "Failed to initialize neural link" });
  }
});

/* ==========================================================
   3️⃣ SAVE NEW MESSAGE (মেসেজ সেভ এবং লাস্ট মেসেজ আপডেট)
   Route: POST /api/messages/message
========================================================== */
router.post("/message", auth, async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const senderId = req.user?.sub || req.user?.id;

    if (!conversationId || !text) {
      return res.status(400).json({ error: "Data missing" });
    }

    const newMessage = new Message({
      conversationId,
      sender: senderId,
      text
    });

    const savedMessage = await newMessage.save();

    // ✅ অত্যন্ত গুরুত্বপূর্ণ: চ্যাট লিস্টের আপডেট টাইম এবং লাস্ট মেসেজ সেট করা
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { 
        updatedAt: Date.now(),
        lastMessage: text // আপনার স্কিমাতে এই ফিল্ডটি থাকলে ভালো হয়
      },
    });

    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json({ error: "Message delivery failed" });
  }
});

/* ==========================================================
   4️⃣ GET MESSAGES OF A CONVERSATION
   Route: GET /api/messages/message/:conversationId
========================================================== */
router.get("/message/:conversationId", auth, async (req, res) => {
  try {
    // মেসেজগুলো টাইম অনুযায়ী সাজানো (পুরানো থেকে নতুন)
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).sort({ createdAt: 1 });
    
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: "Neural history inaccessible" });
  }
});

export default router;
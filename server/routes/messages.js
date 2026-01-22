import express from "express";
const router = express.Router();
import auth from "../middleware/auth.js"; 

// মডেল ইম্পোর্ট
import Conversation from "../models/Conversation.js"; 
import Message from "../models/Message.js";      

/* ==========================================================
   1️⃣ GET ALL CONVERSATIONS (Including Groups)
   Route: GET /api/messages/conversations
========================================================== */
router.get("/conversations", auth, async (req, res) => {
  try {
    const currentUserId = req.user?.sub || req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ error: "Neural identity missing" });
    }

    // ইউজার যে যে কনভারসেশন বা গ্রুপের মেম্বার সেগুলো সব খুঁজে বের করা
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
   2️⃣ CREATE PRIVATE OR GROUP CONVERSATION
   Route: POST /api/messages/conversation
========================================================== */
router.post("/conversation", auth, async (req, res) => {
  const { receiverId, isGroup, groupName, members } = req.body;
  const senderId = req.user?.sub || req.user?.id;

  try {
    // যদি এটি গ্রুপ চ্যাট হয়
    if (isGroup) {
      if (!groupName || !members || members.length === 0) {
        return res.status(400).json({ error: "Group name and members required" });
      }

      const newGroup = new Conversation({
        members: [...new Set([...members, senderId])], // ডুপ্লিকেট রিমুভ করে সেন্ডারকে অ্যাড করা
        isGroup: true,
        groupName: groupName,
        admin: senderId // যে গ্রুপ খুলবে সে অ্যাডমিন
      });

      const savedGroup = await newGroup.save();
      return res.status(200).json(savedGroup);
    }

    // যদি এটি প্রাইভেট (One-to-One) চ্যাট হয়
    if (!receiverId) return res.status(400).json({ error: "Receiver ID required" });

    let conversation = await Conversation.findOne({
      isGroup: false,
      members: { $all: [senderId, receiverId], $size: 2 },
    });

    if (!conversation) {
      conversation = new Conversation({
        members: [senderId, receiverId],
        isGroup: false
      });
      await conversation.save();
    }

    res.status(200).json(conversation);
  } catch (err) {
    console.error("Conversation Post Error:", err);
    res.status(500).json({ error: "Failed to initialize neural link" });
  }
});

/* ==========================================================
   3️⃣ SAVE NEW MESSAGE (Supports Group Messages)
   Route: POST /api/messages/message
========================================================== */
router.post("/message", auth, async (req, res) => {
  try {
    const { conversationId, text, tempId, isGroup } = req.body;
    const senderId = req.user?.sub || req.user?.id;
    const senderName = req.user?.name || "Drifter";

    if (!conversationId || !text) {
      return res.status(400).json({ error: "Data missing: conversationId or text required" });
    }

    // মেসেজ অবজেক্ট তৈরি
    const newMessage = new Message({
      conversationId,
      senderId,
      senderName, // গ্রুপ চ্যাটে দেখার জন্য সেন্ডার নেম সেভ করা ভালো
      text,
      tempId,
      isGroup: isGroup || false
    });

    const savedMessage = await newMessage.save();

    // চ্যাট লিস্টে লেটেস্ট মেসেজ এবং টাইম আপডেট করা
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { 
        updatedAt: Date.now(),
        lastMessage: text 
      },
    });

    res.status(200).json(savedMessage);
  } catch (err) {
    console.error("Message Post Error:", err);
    res.status(500).json({ 
      error: "Message delivery failed", 
      details: err.message 
    });
  }
});

/* ==========================================================
   4️⃣ GET MESSAGES OF A CONVERSATION
   Route: GET /api/messages/message/:conversationId
========================================================== */
router.get("/message/:conversationId", auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // মেসেজগুলো টাইম অনুযায়ী সাজানো
    const messages = await Message.find({
      conversationId: conversationId,
    }).sort({ createdAt: 1 });
    
    res.status(200).json(messages);
  } catch (err) {
    console.error("Message Get Error:", err);
    res.status(500).json({ error: "Neural history inaccessible" });
  }
});

export default router;
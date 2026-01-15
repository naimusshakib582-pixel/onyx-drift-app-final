import express from "express";
const router = express.Router();

// নামের অক্ষর (Case) এবং .js এক্সটেনশন খেয়াল করুন
import Conversation from "../models/Conversation.js"; 
import Message from "../models/Message.js";      

/* ==========================================================
   1️⃣ CREATE OR GET CONVERSATION (Direct Chat)
   Route: POST api/messages/conversation
========================================================== */
router.post("/conversation", async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
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
   2️⃣ GET ALL CONVERSATIONS (Fixing 404 for /conversations)
   Route: GET api/messages/conversations/:userId
========================================================== */
// এখানে 'conversations' (Plural) যোগ করা হয়েছে ফ্রন্টএন্ডের রিকোয়েস্টের সাথে মিল রাখতে
router.get("/conversations/:userId", async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.params.userId] },
    }).sort({ updatedAt: -1 }); // নতুন মেসেজ আসা চ্যাটগুলো উপরে দেখাবে
    
    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json({ error: "Could not sync conversations" });
  }
});

/* ==========================================================
   3️⃣ SAVE NEW MESSAGE
   Route: POST api/messages/message
========================================================== */
router.post("/message", async (req, res) => {
  const newMessage = new Message(req.body);
  try {
    const savedMessage = await newMessage.save();
    
    // মেসেজ পাঠানোর পর কনভারসেশনের 'updatedAt' ফিল্ড আপডেট করা ভালো
    await Conversation.findByIdAndUpdate(req.body.conversationId, {
        $set: { updatedAt: Date.now() }
    });

    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* ==========================================================
   4️⃣ GET MESSAGES OF A CONVERSATION
   Route: GET api/messages/message/:conversationId
========================================================== */
router.get("/message/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
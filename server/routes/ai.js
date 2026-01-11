import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import auth from "../middleware/auth.js";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/generate-caption", auth, async (req, res) => {
  const { prompt } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const fullPrompt = `Create 3 short, viral, and edgy social media captions for this topic: "${prompt}". 
    Use a futuristic/cyberpunk tone, include 2 trending hashtags, and keep it under 20 words.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ captions: text });
  } catch (error) {
    res.status(500).json({ msg: "AI Neural link failed" });
  }
});

export default router;
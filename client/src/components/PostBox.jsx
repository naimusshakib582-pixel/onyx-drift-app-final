import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaImage, FaMicrophone, FaPaperPlane, FaMagic } from 'react-icons/fa';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { BRAND_NAME, AI_NAME } from '../utils/constants';

const PostBox = ({ user, onPostCreated }) => {
  const [text, setText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false); // AI এর জন্য আলাদা স্টেট
  const { getAccessTokenSilently } = useAuth0();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

  // --- AI Magic Function ---
  const handleAIEnhance = async () => {
    if (!text.trim()) return alert("Write something first for the magic to work!");
    
    setIsEnhancing(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        `${API_URL}/api/ai/enhance`, 
        { prompt: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.enhancedText) {
        setText(response.data.enhancedText);
      }
    } catch (error) {
      console.error("AI Magic Error:", error);
      alert("The AI cosmos is busy. Try again in a moment!");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handlePost = async () => {
    if (!text.trim()) return;
    setIsPosting(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        `${API_URL}/api/posts`,
        { desc: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 || response.status === 201) {
        setText("");
        if (onPostCreated) onPostCreated();
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Something went wrong while posting.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl"
    >
      <div className="flex gap-4 items-start">
        <img 
          src={user?.picture || "https://placehold.jp/150x150.png"} 
          className="w-12 h-12 rounded-2xl border border-white/10 object-cover"
          alt="User"
        />
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isEnhancing ? `${AI_NAME} is weaving magic...` : `What's on your mind, ${user?.nickname || 'Drifter'}?`}
            className={`w-full bg-transparent border-none outline-none text-white text-sm placeholder:text-gray-600 resize-none h-20 pt-2 font-light tracking-wide transition-all ${isEnhancing ? 'opacity-50 blur-[1px]' : 'opacity-100'}`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <div className="flex gap-4">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-neon transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <FaImage className="text-lg" />
            <span className="hidden sm:block">Media</span>
          </motion.button>

          {/* AI Magic Button */}
          <motion.button 
            onClick={handleAIEnhance}
            disabled={isEnhancing || !text.trim()}
            whileTap={{ scale: 0.9 }}
            className={`flex items-center gap-2 transition-all text-xs font-bold uppercase tracking-widest ${isEnhancing ? 'text-purple-neon animate-pulse' : 'text-gray-400 hover:text-purple-neon'}`}
          >
            <FaMagic className="text-lg" />
            <span className="hidden sm:block">{isEnhancing ? 'Enhancing...' : `${BRAND_NAME} Magic`}</span>
          </motion.button>
        </div>

        <div className="flex gap-3">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="bg-white/5 p-3 rounded-2xl text-cyan-neon border border-white/5 hover:bg-white/10"
          >
            <FaMicrophone />
          </motion.button>
          
          <motion.button 
            onClick={handlePost}
            whileTap={{ scale: 0.95 }}
            disabled={text.length === 0 || isPosting || isEnhancing}
            className={`px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all
              ${text.length > 0 && !isPosting
                ? 'bg-gradient-to-r from-cyan-neon to-purple-neon text-black shadow-neon-blue' 
                : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'}`}
          >
            {isPosting ? 'Posting...' : 'Post'} <FaPaperPlane />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default PostBox;
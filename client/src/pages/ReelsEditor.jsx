import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ChevronLeft, Send, Hash } from 'lucide-react';

const ReelsEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth0();
  const [videoSrc, setVideoSrc] = useState(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const API_URL = (import.meta.env.VITE_API_BASE_URL || "https://onyx-drift-app-final.onrender.com").replace(/\/$/, "");

  useEffect(() => {
    // MobileNav থেকে পাঠানো ভিডিও ফাইল চেক করা
    if (location.state?.videoFile) {
      const url = URL.createObjectURL(location.state.videoFile);
      setVideoSrc(url);
      return () => URL.revokeObjectURL(url); // মেমোরি ক্লিনআপ
    } else {
      navigate('/feed'); // ভিডিও না থাকলে ফিডে পাঠিয়ে দিবে
    }
  }, [location.state, navigate]);

  // মেইন ট্রান্সমিট লজিক (Backend Integration)
  const handleTransmit = async () => {
    if (!location.state?.videoFile) return toast.error("No signal detected.");
    
    setIsUploading(true);
    const formData = new FormData();
    
    // ভিডিও ফাইল এবং ইউজার ডেটা যোগ করা
    formData.append("file", location.state.videoFile);
    formData.append("content", caption);
    formData.append("type", "video"); // ব্যাকএন্ডে এটি 'video' হিসেবে চিহ্নিত হবে
    formData.append("authorName", user?.name || "Neural Drifter");
    formData.append("authorAvatar", user?.picture || "");

    try {
      const response = await axios.post(`${API_URL}/api/posts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });

      if (response.status === 201) {
        toast.success("Signal Transmitted to the Cloud!");
        navigate('/reels');
      }
    } catch (err) {
      console.error("Neural Upload Error:", err);
      toast.error("Transmission failed. Retry connection.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[2000] flex flex-col overflow-hidden">
      {/* ১. ফুল স্ক্রিন ভিডিও ব্যাকগ্রাউন্ড (Cinema Mode) */}
      <video 
        src={videoSrc} 
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay 
        loop 
        muted 
        playsInline
      />

      {/* ২. ইউআই লেয়ার (Invisible UI) */}
      <div className="relative z-10 h-full flex flex-col justify-between bg-gradient-to-b from-black/60 via-transparent to-black/80 p-6">
        
        {/* টপ বার */}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h2 className="text-cyan-500 text-[10px] font-black tracking-[0.5em] uppercase">Neural Editor</h2>
            <div className="h-[1px] w-8 bg-cyan-500/50 mt-1 animate-pulse"></div>
          </div>
          <div className="w-10"></div>
        </div>

        {/* বটম সেকশন (ক্যাপশন ও কন্ট্রোল) */}
        <div className="space-y-6 mb-10">
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-4 border border-white/10 shadow-2xl">
            <textarea 
              placeholder="Inject a caption into the feed..." 
              className="w-full bg-transparent border-none outline-none text-white text-md placeholder-white/30 resize-none min-h-[80px]"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            
            <div className="flex gap-3 mt-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 rounded-full border border-cyan-500/20 text-[9px] font-bold text-cyan-400 uppercase tracking-widest">
                <Hash size={12} /> WorldBest
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 rounded-full border border-purple-500/20 text-[9px] font-bold text-purple-400 uppercase tracking-widest">
                <Hash size={12} /> Drift
              </button>
            </div>
          </div>

          {/* ট্রান্সমিট বাটন */}
          <button 
            disabled={isUploading}
            onClick={handleTransmit}
            className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-2xl 
              ${isUploading ? 'bg-gray-800 text-gray-500' : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20'}`}
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <span>Transmitting...</span>
              </>
            ) : (
              <>
                <Send size={18} /> Transmit to World
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReelsEditor;
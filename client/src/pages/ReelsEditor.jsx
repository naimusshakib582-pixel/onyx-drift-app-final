import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Scissors, Music, Type, Sparkles, 
  ChevronLeft, BarChart2, Wand2, Send, X 
} from 'lucide-react';

const ReelsEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoFile = location.state?.videoFile;
  const videoRef = useRef(null);
  
  const [videoUrl, setVideoUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('edit'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hookScore, setHookScore] = useState(0);
  const [caption, setCaption] = useState("");

  // API URL Configuration
  const API_URL = (import.meta.env.VITE_API_BASE_URL || "https://onyx-drift-app-final.onrender.com").replace(/\/$/, "");

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);
      setHookScore(Math.floor(Math.random() * 40) + 60);
      return () => URL.revokeObjectURL(url);
    } else {
      navigate('/reels');
    }
  }, [videoFile, navigate]);

  // ১. AI Auto Edit Logic (Simulated)
  const handleAutoEdit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setHookScore(prev => Math.min(prev + 15, 99)); // AI improves score
    }, 2000);
  };

  // ২. Final Upload Function
  const handleFinalPost = async () => {
    if (!videoFile) return;

    const formData = new FormData();
    formData.append("media", videoFile);
    formData.append("text", caption || "Neural Pulse - Onyx Drift");
    formData.append("isReel", "true"); // ব্যাকএন্ডে mediaType="reel" নিশ্চিত করতে

    try {
      setIsUploading(true);
      const response = await axios.post(`${API_URL}/api/posts`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      if (response.status === 201) {
        navigate('/reels');
      }
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Neural Link Failed: Check connection");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden font-sans">
      
      {/* --- Upload Overlay --- */}
      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-10"
          >
            <div className="w-20 h-20 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(6,182,212,0.3)]"></div>
            <h2 className="text-xl font-black tracking-tighter mb-2 italic">TRANSMITTING SIGNAL...</h2>
            <div className="w-full max-w-xs bg-white/10 h-1 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }}
                className="h-full bg-cyan-500 shadow-[0_0_15px_#00f7ff]"
              />
            </div>
            <p className="mt-4 text-cyan-400 font-mono text-xs tracking-widest">{uploadProgress}% SYNCED</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Header --- */}
      <div className="p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-50">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full backdrop-blur-md border border-white/10">
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex items-center gap-3 bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20">
          <BarChart2 size={16} className="text-cyan-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Hook: {hookScore}%</span>
        </div>

        <button 
          onClick={handleFinalPost}
          className="px-6 py-2 bg-cyan-500 rounded-full text-black font-black text-xs uppercase tracking-tighter active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
        >
          Post
        </button>
      </div>

      {/* --- Caption Area --- */}
      <div className="px-6 py-2 bg-gradient-to-b from-black/40 to-transparent">
        <textarea 
          placeholder="Write a neural caption..." 
          className="w-full bg-transparent border-none outline-none text-sm font-medium placeholder:text-white/20 resize-none h-12 scrollbar-hide"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
      </div>

      {/* --- Main Canvas --- */}
      <div className="flex-1 relative flex items-center justify-center px-4 py-2">
        <div className="w-full max-w-[350px] aspect-[9/16] bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 relative">
          {videoUrl && (
            <video 
              ref={videoRef}
              src={videoUrl} 
              className="w-full h-full object-cover"
              autoPlay loop muted playsInline
            />
          )}
          
          <AnimatePresence>
            {isProcessing && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-20"
              >
                <Wand2 size={48} className="text-cyan-400 animate-bounce mb-4" />
                <p className="text-[10px] font-black tracking-[0.4em] uppercase text-cyan-400">Neural Enhancing...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- Smart Timeline --- */}
      <div className="px-8 py-4">
        <div className="h-14 w-full bg-white/[0.03] rounded-2xl border border-white/5 relative overflow-hidden flex items-center group">
           <div className="absolute left-1/2 w-0.5 h-full bg-cyan-500 z-10 shadow-[0_0_15px_#00f7ff]"></div>
           <div className="flex gap-1 opacity-20 px-4 items-center w-full justify-center">
             {[...Array(30)].map((_, i) => (
               <div key={i} className="w-1 bg-white rounded-full" style={{ height: `${Math.random() * 30 + 10}px` }}></div>
             ))}
           </div>
        </div>
      </div>

      {/* --- Floating Controls --- */}
      <div className="pb-10 pt-2 px-6">
        <div className="bg-zinc-900/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-2 flex justify-around items-center shadow-2xl">
          <EditorTab icon={<Wand2 />} label="AI Edit" active={activeTab === 'ai'} onClick={handleAutoEdit} isSpecial />
          <EditorTab icon={<Scissors />} label="Trim" active={activeTab === 'edit'} onClick={() => setActiveTab('edit')} />
          <EditorTab icon={<Music />} label="Beats" active={activeTab === 'music'} onClick={() => setActiveTab('music')} />
          <EditorTab icon={<Type />} label="Text" active={activeTab === 'text'} onClick={() => setActiveTab('text')} />
          <EditorTab icon={<Sparkles />} label="FX" active={activeTab === 'fx'} onClick={() => setActiveTab('fx')} />
        </div>
      </div>

    </div>
  );
};

const EditorTab = ({ icon, label, active, onClick, isSpecial }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all duration-300 ${
      active ? 'text-cyan-400 scale-110' : 'text-white/30 hover:text-white/60'
    } ${isSpecial ? 'bg-cyan-500/10 rounded-2xl border border-cyan-500/20' : ''}`}
  >
    {React.cloneElement(icon, { size: 20, strokeWidth: active ? 2.5 : 2 })}
    <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-50'}`}>
      {label}
    </span>
  </button>
);

export default ReelsEditor;
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Music, UserPlus, Copy, Download, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- হেল্পার কম্পোনেন্ট: শেয়ার শীট ---
const ShareSheet = ({ reel, onClose }) => {
  const shareUrl = `${window.location.origin}/post/${reel._id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Neural Signal Copied!");
    onClose();
  };

  return (
    <motion.div 
      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-3xl rounded-t-[2.5rem] z-[1001] p-8 border-t border-white/10 pb-12"
    >
      <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" onClick={onClose} />
      <h3 className="text-center text-xs font-black tracking-[0.3em] uppercase mb-8 text-cyan-400">Transmit Signal</h3>
      
      <div className="grid grid-cols-4 gap-6 mb-10">
        <ShareBtn icon={<Copy />} label="Copy" color="bg-white/5" onClick={copyLink} />
        <ShareBtn icon={<Download />} label="Save" color="bg-white/5" onClick={() => alert("Downloading...")} />
        <ShareBtn icon={<ExternalLink />} label="Direct" color="bg-cyan-500/20 text-cyan-400" onClick={() => window.open(shareUrl)} />
        <ShareBtn icon={<Share2 />} label="More" color="bg-white/5" onClick={() => navigator.share({ url: shareUrl })} />
      </div>

      <button 
        onClick={onClose}
        className="w-full py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 active:scale-95 transition-all"
      >
        Close System
      </button>
    </motion.div>
  );
};

const ShareBtn = ({ icon, label, color, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-3 group">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center transition-transform group-active:scale-90 border border-white/5`}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">{label}</span>
  </button>
);

// --- মেইন ফিড কম্পোনেন্ট ---
const ReelsFeed = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const API_URL = (import.meta.env.VITE_API_BASE_URL || "https://onyx-drift-app-final.onrender.com").replace(/\/$/, "");

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/posts/reels/all`); 
        setReels(response.data);
      } catch (err) {
        console.error("Neural Reels Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, [API_URL]);

  return (
    <div 
      ref={containerRef}
      className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
      style={{ scrollBehavior: 'smooth' }}
    >
      {loading ? (
        <div className="h-screen flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-[10px] text-cyan-500 font-black tracking-[0.5em] uppercase animate-pulse">Syncing Neural Feed...</p>
        </div>
      ) : reels.length === 0 ? (
        <div className="h-screen flex items-center justify-center text-white/40 font-mono text-xs uppercase tracking-widest">
          No signals found in this sector.
        </div>
      ) : (
        reels.map((reel) => (
          <ReelItem key={reel._id} reel={reel} API_URL={API_URL} />
        ))
      )}
    </div>
  );
};

// --- রিল আইটেম কম্পোনেন্ট ---
const ReelItem = ({ reel, API_URL }) => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likes?.length || 0);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleEngagement = async () => {
    try { await axios.post(`${API_URL}/api/posts/${reel._id}/pulse`); } catch (err) { }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {});
            const timer = setTimeout(() => { if (entry.isIntersecting) handleEngagement(); }, 5000);
            return () => clearTimeout(timer);
          } else {
            videoRef.current?.pause();
            if (videoRef.current) videoRef.current.currentTime = 0;
          }
        });
      },
      { threshold: 0.7 }
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const handleLikeToggle = async () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    try { await axios.put(`${API_URL}/api/posts/${reel._id}/like`); } catch (err) { }
  };

  const handleDoubleTap = () => {
    if (!isLiked) handleLikeToggle();
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  const avatarUrl = reel.authorAvatar && !reel.authorAvatar.includes("placeholder") 
    ? reel.authorAvatar 
    : `https://ui-avatars.com/api/?name=${reel.authorName || 'D'}&background=random&color=fff`;

  return (
    <div 
      className="h-screen w-full snap-start relative flex items-center justify-center bg-black overflow-hidden"
      onDoubleClick={handleDoubleTap}
    >
      {/* হার্ট এনিমেশন */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.5, opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <Heart size={100} fill="#00f7ff" className="text-cyan-400 drop-shadow-[0_0_20px_rgba(0,247,255,0.8)]" />
          </motion.div>
        )}
      </AnimatePresence>

      <video
        ref={videoRef}
        src={reel.media || reel.mediaUrl}
        className="w-full h-full object-cover cursor-pointer"
        loop playsInline
        onClick={() => videoRef.current?.paused ? videoRef.current.play() : videoRef.current.pause()}
      />

      {/* কন্টেন্ট লেয়ার */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 flex flex-col justify-end p-5 pb-28">
        <div className="flex justify-between items-end w-full">
          
          <div className="flex-1 pr-12 text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative cursor-pointer" onClick={() => navigate(`/profile/${reel.authorAuth0Id || reel.authorId}`)}>
                <img src={avatarUrl} className="w-11 h-11 rounded-full border-2 border-cyan-500/50 object-cover" alt="author" />
                <div className="absolute -bottom-1 -right-1 bg-cyan-500 rounded-full p-0.5 text-black border-2 border-black">
                  <UserPlus size={10} strokeWidth={4} />
                </div>
              </div>
              <div onClick={() => navigate(`/profile/${reel.authorAuth0Id || reel.authorId}`)}>
                <h4 className="font-black text-sm tracking-tighter">@{reel.authorName || 'Drifter'}</h4>
                <div className="flex items-center gap-1.5 text-[9px] text-cyan-400 font-bold uppercase tracking-[0.2em]">
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
                  Neural Signal
                </div>
              </div>
            </div>

            <p className="text-sm leading-relaxed line-clamp-2 opacity-90 font-medium max-w-[85%]">
              {reel.text || reel.content}
            </p>

            <div className="flex items-center gap-2 py-1 px-3 bg-white/5 backdrop-blur-md rounded-full w-fit border border-white/10 overflow-hidden">
              <Music size={12} className="animate-spin-slow text-cyan-400 shrink-0" />
              <div className="w-32 overflow-hidden relative">
                <p className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap animate-marquee-text">
                   {reel.authorName} • Original Neural Audio Track • {reel.authorName}
                </p>
              </div>
            </div>
          </div>

          {/* সাইডবার বাটন */}
          <div className="flex flex-col gap-6 items-center z-[999]">
            <ActionButton icon={<Heart fill={isLiked ? "#00f7ff" : "none"} className={isLiked ? "text-cyan-400" : "text-white opacity-80"} />} count={likesCount} onClick={handleLikeToggle} />
            <ActionButton icon={<MessageCircle className="text-white opacity-80" />} count={reel.comments?.length || 0} />
            <ActionButton 
              icon={<Share2 className="text-white opacity-80" />} 
              count="Signal" 
              onClick={(e) => { e.stopPropagation(); setIsShareOpen(true); }} 
            />
            
            <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 p-1 animate-spin-slow mt-2 cursor-pointer" onClick={() => navigate(`/profile/${reel.authorAuth0Id || reel.authorId}`)}>
              <img src={avatarUrl} className="w-full h-full rounded-full object-cover" alt="disc" />
            </div>
          </div>
        </div>
      </div>

      {/* শেয়ার শীট ইন্টারফেস */}
      <AnimatePresence>
        {isShareOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsShareOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]" 
            />
            <ShareSheet reel={reel} onClose={() => setIsShareOpen(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const ActionButton = ({ icon, count, onClick }) => (
  <div className="flex flex-col items-center gap-1">
    <button onClick={onClick} className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-75 transition-all">
      {React.cloneElement(icon, { size: 26 })}
    </button>
    <span className="text-[10px] font-black text-white">{count}</span>
  </div>
);

export default ReelsFeed;
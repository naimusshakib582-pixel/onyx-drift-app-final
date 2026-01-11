import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaHeart, FaRegHeart, FaRegComment, FaTrashAlt, 
  FaShare, FaPaperPlane, FaPlay, FaPause, FaVolumeMute, FaVolumeUp, FaDownload 
} from "react-icons/fa";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import html2canvas from "html2canvas"; // এটি যোগ করা হয়েছে

const PostCard = ({ post, onAction, onDelete, onUserClick }) => {
  const { user, getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const postRef = useRef(null); // কার্ড ক্যাপচার করার জন্য রেফারেন্স

  if (!post) return null;

  const API_URL = (import.meta.env.VITE_API_BASE_URL || "https://onyx-drift-app-final.onrender.com").replace(/\/$/, "");

  const likesArray = Array.isArray(post.likes) ? post.likes : [];
  const isLiked = user && likesArray.includes(user.sub);

  // 🔥 ভাইরাল শেয়ার কার্ড জেনারেশন ফাংশন
  const generateShareCard = async () => {
    if (postRef.current) {
      try {
        const canvas = await html2canvas(postRef.current, {
          backgroundColor: "#020617",
          useCORS: true, // ক্লাউডিনারি ইমেজ সাপোর্ট করার জন্য
          scale: 2, // হাই কোয়ালিটি ইমেজ
          borderRadius: 40
        });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `OnyxDrift_${post.authorName || 'post'}.png`;
        link.click();
      } catch (err) {
        console.error("Share Card Error:", err);
      }
    }
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    const targetId = post.authorAuth0Id || post.author || post.userId;
    console.log("Neural Link Data:", { clickedUser: post.authorName, idFound: targetId });
    if (onUserClick && targetId) {
      onUserClick(targetId);
    } else {
      console.warn("Neural Link: Target ID not found for this drifter.");
      alert("Signal lost: This drifter's identity is not linked yet.");
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return alert("Please login to like this signal");
    if (isLiking) return;
    try {
      setIsLiking(true);
      const token = await getAccessTokenSilently();
      await axios.put(`${API_URL}/api/posts/${post._id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onAction) onAction();
    } catch (err) { 
      console.error("Like Error:", err.response?.data || err.message);
    } finally { 
      setIsLiking(false); 
    }
  };

  const renderMedia = () => {
    if (!post.media) return null;
    const isVideo = post.mediaType === "video" || post.mediaType === "reel";
    const isReel = post.mediaType === "reel";

    if (isVideo) {
      return (
        <div className={`relative group overflow-hidden rounded-[2rem] border border-white/5 bg-black/40 ${isReel ? "aspect-[9/16] max-h-[550px] mx-auto w-[90%]" : "aspect-video"}`}>
          <video
            ref={videoRef}
            src={post.media}
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover cursor-pointer"
            onClick={togglePlay}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 pointer-events-none">
            <div className="flex items-center justify-between pointer-events-auto">
              <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="p-3 bg-cyan-400/20 backdrop-blur-xl rounded-full text-cyan-400 border border-cyan-400/20">
                {isPlaying ? <FaPause size={12}/> : <FaPlay size={12}/>}
              </button>
              <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="p-3 bg-white/5 backdrop-blur-xl rounded-full text-white border border-white/10">
                {isMuted ? <FaVolumeMute size={12}/> : <FaVolumeUp size={12}/>}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="px-1">
        <img 
          src={post.media} 
          className="rounded-[2.2rem] w-full object-cover max-h-[600px] border border-white/10 shadow-2xl" 
          alt="Neural Grid Content"
          loading="lazy"
          crossOrigin="anonymous" // ভাইরাল শেয়ারের জন্য জরুরি
        />
      </div>
    );
  };

  return (
    <motion.div 
      ref={postRef} // রেফারেন্স সেট করা হলো
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 rounded-[2.8rem] overflow-hidden mb-10 w-full group/card hover:border-white/10 transition-colors shadow-2xl"
    >
      {/* Header Section */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleProfileClick}
            className="p-[2px] rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600 cursor-pointer shadow-lg"
          >
            <img 
              src={post.authorAvatar || `https://ui-avatars.com/api/?name=${post.authorName || 'Drifter'}&background=random`} 
              className="w-11 h-11 rounded-[0.9rem] object-cover border-2 border-[#0b1120]" 
              alt="author" 
              crossOrigin="anonymous"
            />
          </motion.div>

          <div className="cursor-pointer group/name" onClick={handleProfileClick}>
            <h4 className="font-black text-white text-sm tracking-tight uppercase italic group-hover/name:text-cyan-400 transition-colors flex items-center gap-2">
              {post.authorName || 'UNKNOWN DRIFTER'}
              {post.isVerified && <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"/>}
            </h4>
            <p className="text-[9px] text-gray-500 font-black tracking-[0.2em] uppercase mt-0.5">
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'REALTIME'} • {post.mediaType || 'SIGNAL'}
            </p>
          </div>
        </div>

        {/* Delete Action */}
        {(user?.sub === post.author || user?.sub === post.authorAuth0Id) && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if(window.confirm("TERMINATE THIS SIGNAL?")) {
                onDelete(post._id);
              }
            }} 
            className="p-2.5 text-gray-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
          >
            <FaTrashAlt size={14} />
          </button>
        )}
      </div>

      {/* Post Text */}
      <div className="px-9 pb-5">
        <p className="text-gray-300 text-sm font-medium leading-relaxed tracking-wide opacity-90">
          {post.text}
        </p>
      </div>

      {/* Media Content */}
      <div className="px-5 pb-5">
        {renderMedia()}
      </div>

      {/* Interactions Footer */}
      <div className="px-8 py-5 flex items-center justify-between border-t border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-10">
          <button 
            onClick={handleLike} 
            disabled={isLiking}
            className={`flex items-center gap-2.5 group transition-all ${isLiked ? "text-rose-500" : "text-gray-500 hover:text-rose-400"}`}
          >
            <motion.div whileTap={{ scale: 0.7 }} className={isLiked ? "drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" : ""}>
              {isLiked ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
            </motion.div>
            <span className="text-xs font-black italic tracking-widest">{likesArray.length}</span>
          </button>

          <button 
            onClick={() => setShowComments(!showComments)} 
            className="flex items-center gap-2.5 text-gray-500 hover:text-cyan-400 transition-all"
          >
            <FaRegComment size={20} />
            <span className="text-xs font-black italic tracking-widest">{post.comments?.length || 0}</span>
          </button>
        </div>
        
        {/* শেয়ার কার্ড ডাউনলোড বাটন */}
        <button 
          onClick={(e) => { e.stopPropagation(); generateShareCard(); }}
          className="p-2 text-gray-600 hover:text-cyan-400 transition-all flex items-center gap-2"
          title="Download Viral Share Card"
        >
            <FaDownload size={18} />
            <span className="text-[10px] font-bold uppercase italic">Viral Share</span>
        </button>
      </div>
    </motion.div>
  );
};

export default PostCard;
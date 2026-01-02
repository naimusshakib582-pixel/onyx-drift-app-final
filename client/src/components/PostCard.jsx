import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaHeart, FaRegHeart, FaRegComment, FaTrashAlt, 
  FaShare, FaPaperPlane, FaPlay, FaPause, FaVolumeMute, FaVolumeUp 
} from "react-icons/fa";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { BRAND_NAME } from "../utils/constants";

const PostCard = ({ post, onAction }) => {
  const { user, getAccessTokenSilently } = useAuth0();
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";
  const isLiked = post.likes?.includes(user?.sub);

  // ভিডিও প্লে/পজ লজিক
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isLiking) return;
    try {
      setIsLiking(true);
      const token = await getAccessTokenSilently();
      await axios.put(`${API_URL}/api/posts/${post._id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onAction();
    } catch (err) { console.error(err); } finally { setIsLiking(false); }
  };

  // রেন্ডার মিডিয়া লজিক (Photo vs Video vs Reels)
  const renderMedia = () => {
    if (!post.media) return null;

    const isVideo = post.mediaType === "video" || post.mediaType === "reel";
    const isReel = post.mediaType === "reel";

    if (isVideo) {
      return (
        <div className={`relative group overflow-hidden rounded-[2rem] border border-white/5 bg-black ${isReel ? "aspect-[9/16] max-h-[600px] mx-auto w-[85%]" : "aspect-video"}`}>
          <video
            ref={videoRef}
            src={post.media}
            loop
            muted={isMuted}
            className="w-full h-full object-cover"
            onClick={togglePlay}
          />
          {/* Video Overlay Controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
            <div className="flex items-center justify-between">
              <button onClick={togglePlay} className="p-3 bg-cyan-400/20 backdrop-blur-md rounded-full text-cyan-400">
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button onClick={() => setIsMuted(!isMuted)} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white">
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
            </div>
          </div>
          {isReel && (
            <div className="absolute top-4 left-4 bg-rose-600 text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-lg">
              REEL
            </div>
          )}
        </div>
      );
    }

    // Default Image View
    return (
      <div className="px-2">
        <img 
          src={post.media} 
          className="rounded-[2rem] w-full object-cover max-h-[500px] border border-white/5 shadow-2xl transition-all hover:scale-[1.005]" 
          alt="Neural Post"
        />
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden mb-8 w-full group/card"
    >
      {/* ১. পোস্ট হেডার */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-[2px] rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-600 shadow-lg">
            <img 
              src={post.authorAvatar || `https://ui-avatars.com/api/?name=${post.authorName}`} 
              className="w-10 h-10 rounded-[0.8rem] object-cover border-2 border-[#020617]" 
              alt="author" 
            />
          </div>
          <div>
            <h4 className="font-black text-white text-xs tracking-tighter uppercase italic">{post.authorName}</h4>
            <p className="text-[8px] text-gray-500 font-bold tracking-[0.2em] uppercase">
              {new Date(post.createdAt).toLocaleDateString()} • {post.mediaType || 'neural'}
            </p>
          </div>
        </div>
        {user?.sub === post.authorId && (
          <button onClick={() => {/* handle delete */}} className="text-gray-600 hover:text-rose-500 transition-colors">
            <FaTrashAlt size={12} />
          </button>
        )}
      </div>

      {/* ২. টেক্সট কন্টেন্ট */}
      <div className="px-8 pb-4">
        <p className="text-gray-300 text-sm font-light leading-relaxed tracking-wide">
          {post.text}
        </p>
      </div>

      {/* ৩. মিডিয়া রেন্ডারিং (Photo/Video/Reel) */}
      <div className="px-4 pb-4">
        {renderMedia()}
      </div>

      {/* ৪. লাইক ও কমেন্ট স্ট্যাটাস */}
      <div className="px-8 py-5 flex items-center justify-between border-t border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-8">
          <button onClick={handleLike} className={`flex items-center gap-2 group ${isLiked ? "text-rose-500" : "text-gray-500"}`}>
            <motion.div whileTap={{ scale: 0.8 }}>
              {isLiked ? <FaHeart size={18} className="drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]" /> : <FaRegHeart size={18} />}
            </motion.div>
            <span className="text-[10px] font-black uppercase tracking-widest">{post.likes?.length || 0}</span>
          </button>

          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 text-gray-500 hover:text-cyan-400">
            <FaRegComment size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">{post.comments?.length || 0}</span>
          </button>
        </div>
        <FaShare className="text-gray-600 hover:text-white transition-all cursor-pointer" size={16} />
      </div>

      {/* ৫. কমেন্ট সেকশন */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="px-6 pb-6 overflow-hidden">
            <div className="space-y-4 pt-4">
               {/* এখানে লুপ চালিয়ে কমেন্টগুলো দেখাবেন */}
               <div className="flex gap-2 bg-white/5 p-3 rounded-2xl border border-white/10">
                 <input 
                   type="text" 
                   placeholder="Echo your thoughts..." 
                   className="bg-transparent flex-1 text-xs outline-none text-white"
                   value={commentText}
                   onChange={(e) => setCommentText(e.target.value)}
                 />
                 <button className="text-cyan-400 p-2"><FaPaperPlane size={14}/></button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;
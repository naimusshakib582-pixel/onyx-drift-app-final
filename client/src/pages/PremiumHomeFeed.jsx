import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaImage, FaHeart, FaComment, FaShareAlt, FaDownload, FaEllipsisH, FaCheckCircle } from 'react-icons/fa'; 
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { io } from "socket.io-client"; 

// --- Video Auto-play Component ---
const AutoPlayVideo = ({ src }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      }, { threshold: 0.5 }
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <video 
      ref={videoRef} 
      src={src} 
      muted 
      loop 
      playsInline 
      className="w-full h-auto max-h-[500px] object-contain rounded-xl bg-black" 
    />
  );
};

const PremiumHomeFeed = ({ searchQuery = "", isPostModalOpen, setIsPostModalOpen }) => {
  const { user, getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postText, setPostText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  // API URL সরাসরি ডিফাইন করা হয়েছে যাতে ভুল না হয়
  const API_URL = "https://onyx-drift-app-final.onrender.com";
  const postMediaRef = useRef(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/posts`);
      setPosts(response.data);
    } catch (err) { 
      console.error("Fetch Error:", err);
      setError("Server connection failed. Please check if the backend is live.");
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handlePostSubmit = async () => {
    if (!postText.trim() && !mediaFile) return;
    setIsSubmitting(true);
    try {
      const token = await getAccessTokenSilently();
      const formData = new FormData();
      formData.append("text", postText);
      if (mediaFile) formData.append("media", mediaFile);
      formData.append("isReel", "false");

      await axios.post(`${API_URL}/api/posts`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });

      setPostText(""); setMediaFile(null); setMediaPreview(null);
      setIsPostModalOpen(false); fetchPosts();
    } catch (err) {
      console.error("Submit Error:", err);
    } finally { setIsSubmitting(false); }
  };

  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onload = () => setMediaPreview(reader.result);
      reader.readAsAsDataURL(file);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#02040a] text-white pt-4 pb-32 overflow-x-hidden font-sans">
      <section className="max-w-[550px] mx-auto px-4">
        
        {/* এরর স্ট্যাটাস মেসেজ */}
        {error && (
          <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[11px] uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4 mb-6 opacity-40">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">Neural Feed</h3>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-white/20 to-transparent"></div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col">
            {posts.map((post) => (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                key={post._id} 
                className="flex gap-3 py-5 border-b border-white/5 hover:bg-white/[0.01] transition-all"
              >
                <div className="flex-shrink-0">
                  <img src={post.authorPicture || "https://via.placeholder.com/50"} className="w-12 h-12 rounded-full border border-white/10" alt="" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="text-[15px] font-bold text-gray-100 truncate hover:underline cursor-pointer">{post.authorName}</span>
                      <FaCheckCircle className="text-cyan-500 text-[11px] flex-shrink-0" />
                      <span className="text-[13px] text-gray-500 truncate">@{post.authorName?.split(' ')[0].toLowerCase()}</span>
                      <span className="text-gray-600 text-[13px]">· {new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <FaEllipsisH className="text-gray-600 text-sm" />
                  </div>

                  <p className="text-[15px] text-gray-200 leading-normal mt-1 mb-3">{post.text}</p>

                  {post.mediaUrl && (
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                      {post.mediaUrl.match(/\.(mp4|webm)$/) || post.mediaUrl.includes('video') ? (
                        <AutoPlayVideo src={post.mediaUrl} />
                      ) : (
                        <img src={post.mediaUrl} className="w-full h-auto object-cover" alt="" loading="lazy" />
                      )}
                    </div>
                  )}

                  <div className="flex justify-between mt-4 max-w-[420px] text-gray-500">
                    <button className="flex items-center gap-2 hover:text-cyan-400 transition-colors group">
                      <div className="p-2 group-hover:bg-cyan-500/10 rounded-full"><FaComment size={16}/></div>
                      <span className="text-xs">{post.comments?.length || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-pink-500 transition-colors group">
                      <div className="p-2 group-hover:bg-pink-500/10 rounded-full"><FaHeart size={16}/></div>
                      <span className="text-xs">{post.likes?.length || 0}</span>
                    </button>
                    <button className="p-2 hover:text-green-500 hover:bg-green-500/10 rounded-full transition-colors"><FaDownload size={15}/></button>
                    <button className="p-2 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-full transition-colors"><FaShareAlt size={15}/></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* পোস্ট মডাল */}
      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-start sm:items-center justify-center pt-4 sm:pt-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPostModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-[#0d1117] rounded-2xl border border-white/10 shadow-2xl mx-4 overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <button onClick={() => setIsPostModalOpen(false)} className="text-gray-400 hover:text-white"><FaTimes size={18}/></button>
                  <button 
                    disabled={isSubmitting || (!postText.trim() && !mediaFile)} 
                    onClick={handlePostSubmit} 
                    className="bg-cyan-500 text-white px-5 py-1.5 rounded-full text-[13px] font-bold disabled:opacity-40 transition-all"
                  >
                    {isSubmitting ? "Syncing..." : "Transmit"}
                  </button>
                </div>
                <div className="flex gap-3">
                  <img src={user?.picture} className="w-10 h-10 rounded-full" alt="" />
                  <textarea 
                    autoFocus 
                    value={postText} 
                    onChange={(e) => setPostText(e.target.value)} 
                    placeholder="What's happening?" 
                    className="w-full bg-transparent text-[19px] text-gray-100 placeholder-gray-600 outline-none resize-none min-h-[120px]" 
                  />
                </div>
                {mediaPreview && (
                  <div className="relative mt-2 rounded-xl overflow-hidden border border-white/10 max-h-[250px] bg-black">
                    <img src={mediaPreview} className="w-full h-full object-contain" alt="preview" />
                    <button onClick={() => {setMediaPreview(null); setMediaFile(null);}} className="absolute top-2 right-2 bg-black/70 p-1.5 rounded-full text-white"><FaTimes size={10}/></button>
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-white/5">
                   <button onClick={() => postMediaRef.current.click()} className="text-cyan-500 hover:bg-cyan-500/10 p-2 rounded-full transition-all">
                     <FaImage size={20} />
                   </button>
                   <input type="file" ref={postMediaRef} onChange={handleMediaSelect} hidden accept="image/*,video/*" />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PremiumHomeFeed;
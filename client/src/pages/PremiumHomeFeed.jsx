import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaImage, FaHeart, FaComment, FaShareAlt, FaDownload, FaEllipsisH, FaCheckCircle } from 'react-icons/fa'; 
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { io } from "socket.io-client"; 

// --- ভিডিওর জন্য অটো-প্লে কম্পোনেন্ট ---
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
      },
      { threshold: 0.6 } // ভিডিওটি ৬০% স্ক্রিনে আসলে প্লে হবে
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
      className="w-full h-auto max-h-[550px] object-contain"
    />
  );
};

const PremiumHomeFeed = ({ searchQuery = "", isPostModalOpen, setIsPostModalOpen }) => {
  const { user, getAccessTokenSilently, isAuthenticated } = useAuth0();
  
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  const API_URL = (import.meta.env.VITE_API_BASE_URL || "https://onyx-drift-app-final.onrender.com").replace(/\/$/, "");
  const postMediaRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      socketRef.current = io(API_URL, { transports: ["polling", "websocket"] });
      socketRef.current.on("receiveNewPost", (newPost) => {
        setPosts((prev) => [newPost, ...prev]);
      });
      return () => socketRef.current?.disconnect();
    }
  }, [isAuthenticated, API_URL]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/posts`);
      setPosts(response.data);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchPosts(); 
  }, []);

  const filteredPosts = posts.filter((post) => {
    const term = searchQuery.toLowerCase();
    return (
      post.authorName?.toLowerCase().includes(term) || 
      post.text?.toLowerCase().includes(term)
    );
  });

  const handlePostSubmit = async () => {
    if (!postText.trim() && !mediaFile) return;
    setIsSubmitting(true);
    
    try {
      const token = await getAccessTokenSilently();
      const formData = new FormData();
      formData.append("text", postText);
      if (mediaFile) formData.append("media", mediaFile); 
      formData.append("isReel", "false"); 

      const response = await axios.post(`${API_URL}/api/posts`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "multipart/form-data" 
        }
      });

      if (response.status === 201 || response.status === 200) {
        setPostText(""); setMediaFile(null); setMediaPreview(null);
        setIsPostModalOpen(false); fetchPosts(); 
      }
    } catch (err) { 
      console.error("Transmission Failed:", err);
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onload = () => setMediaPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#02040a] text-white pt-2 pb-24 font-sans">
      
      {/* ১. ফিড হেডার (আপনার রিকোয়েস্ট অনুযায়ী অপরিবর্তিত) */}
      <section className="flex flex-col px-4 max-w-[600px] mx-auto">
        <div className="flex items-center gap-4 mb-4 opacity-40 mt-2">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">Neural Feed</h3>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-white/20 to-transparent"></div>
        </div>

        {/* ২. টুইটার স্টাইল পোস্ট লিস্ট */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredPosts.map(post => (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                key={post._id} 
                className="flex gap-3 px-3 py-4 border-b border-white/10 hover:bg-white/[0.02] transition-colors"
              >
                {/* প্রোফাইল পিকচার */}
                <div className="flex-shrink-0">
                  <img 
                    src={post.authorPicture || "https://via.placeholder.com/40"} 
                    className="w-12 h-12 rounded-full object-cover border border-white/5" 
                    alt="User" 
                  />
                </div>

                {/* কন্টেন্ট এরিয়া */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 overflow-hidden">
                      <span className="text-[15px] font-bold text-gray-100 truncate hover:underline cursor-pointer">{post.authorName || "Anonymous"}</span>
                      <FaCheckCircle className="text-cyan-500 text-[12px] flex-shrink-0" />
                      <span className="text-[14px] text-gray-500 truncate">@{post.authorName?.split(' ')[0].toLowerCase()}</span>
                      <span className="text-gray-600 text-[14px]">· {new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <FaEllipsisH className="text-gray-600 text-sm" />
                  </div>

                  {/* টেক্সট */}
                  {post.text && <p className="text-[15px] text-gray-200 mt-0.5 mb-3 leading-normal">{post.text}</p>}

                  {/* ভিডিও/ইমেজ (Twitter Style Curved Border) */}
                  {post.mediaUrl && (
                    <div className="mt-2 rounded-[16px] overflow-hidden border border-white/10 bg-black/40">
                      {post.mediaUrl.match(/\.(mp4|webm|ogg)$/) || post.mediaUrl.includes('video') ? (
                        <AutoPlayVideo src={post.mediaUrl} />
                      ) : (
                        <img 
                          src={post.mediaUrl} 
                          className="w-full h-auto max-h-[600px] object-cover" 
                          alt="Post content" 
                          loading="lazy"
                        />
                      )}
                    </div>
                  )}

                  {/* ইন্টারেকশন বার */}
                  <div className="flex justify-between items-center mt-4 max-w-md opacity-70">
                    <button className="flex items-center gap-2 group text-gray-500 hover:text-cyan-400">
                      <div className="p-2 group-hover:bg-cyan-500/10 rounded-full transition-all"><FaComment size={16}/></div>
                      <span className="text-xs">{post.comments?.length || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 group text-gray-500 hover:text-pink-500">
                      <div className="p-2 group-hover:bg-pink-500/10 rounded-full transition-all"><FaHeart size={16}/></div>
                      <span className="text-xs">{post.likes?.length || 0}</span>
                    </button>
                    <button className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-500/10 rounded-full transition-all">
                      <FaDownload size={15}/>
                    </button>
                    <button className="p-2 text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-full transition-all">
                      <FaShareAlt size={15}/>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ৩. পোস্ট মডাল */}
      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-start sm:items-center justify-center pt-4 sm:pt-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPostModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-[#0d1117] rounded-2xl border border-white/10 shadow-2xl mx-4 overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <button onClick={() => setIsPostModalOpen(false)} className="text-gray-400 hover:text-white"><FaTimes size={18}/></button>
                  <button 
                    disabled={isSubmitting || (!postText.trim() && !mediaFile)} 
                    onClick={handlePostSubmit} 
                    className="bg-cyan-500 text-white px-5 py-1.5 rounded-full text-[13px] font-bold hover:bg-cyan-600 disabled:opacity-40 transition-all"
                  >
                    {isSubmitting ? "Syncing..." : "Transmit"}
                  </button>
                </div>
                <div className="flex gap-3">
                  <img src={user?.picture} className="w-10 h-10 rounded-full" alt="me" />
                  <textarea 
                    autoFocus 
                    value={postText} 
                    onChange={(e) => setPostText(e.target.value)} 
                    placeholder="Share with the drift..." 
                    className="w-full bg-transparent text-[19px] text-gray-100 placeholder-gray-600 outline-none resize-none min-h-[140px]" 
                  />
                </div>
                {mediaPreview && (
                  <div className="relative mt-2 rounded-xl overflow-hidden border border-white/10 max-h-[280px] bg-black">
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
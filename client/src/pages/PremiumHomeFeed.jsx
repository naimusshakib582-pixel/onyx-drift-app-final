import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTimes, FaImage, FaVideo, FaPaperPlane, FaSearch, FaRegBell } from 'react-icons/fa'; 
import { HiOutlineSparkles, HiOutlineMenuAlt4 } from "react-icons/hi"; 
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useNavigate } from 'react-router-dom'; 
import { io } from "socket.io-client"; 
import PostCard from "../components/PostCard"; 

const PremiumHomeFeed = () => {
  const { user, getAccessTokenSilently, isAuthenticated } = useAuth0();
  const navigate = useNavigate(); 
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const [selectedPostMedia, setSelectedPostMedia] = useState(null);
  const [mediaFile, setMediaFile] = useState(null); 
  const [mediaType, setMediaType] = useState(null); 
  const postFileInputRef = useRef(null);
  const socketRef = useRef(null); 

  const API_URL = (import.meta.env.VITE_API_BASE_URL || "https://onyx-drift-app-final.onrender.com").replace(/\/$/, "");

  // AI Logic and Socket (Keeping your original logic)
  const handleAICaption = async () => {
    if (!postText.trim()) return;
    setAiLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const { data } = await axios.post(`${API_URL}/api/communities/generate-caption`, { prompt: postText }, { headers: { Authorization: `Bearer ${token}` } });
      setPostText(data.captions);
    } catch (err) { console.error("AI Error:", err); } finally { setAiLoading(false); }
  };

  useEffect(() => {
    if (isAuthenticated) {
      socketRef.current = io(API_URL, { transports: ["websocket", "polling"], path: "/socket.io/", withCredentials: true });
      socketRef.current.on("receiveNewPost", (newPost) => { setPosts((prev) => [newPost, ...prev]); });
      return () => { if (socketRef.current) socketRef.current.disconnect(); };
    }
  }, [isAuthenticated, API_URL]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/posts?t=${Date.now()}`);
      setPosts(response.data);
    } catch (err) { console.error("Fetch Error:", err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handlePostSubmit = async () => {
    if (!postText.trim() && !mediaFile) return;
    try {
      const token = await getAccessTokenSilently();
      const postData = { text: postText, authorName: user?.nickname || "Drifter", authorAvatar: user?.picture || "", authorId: user?.sub, media: selectedPostMedia, mediaType: mediaType };
      await axios.post(`${API_URL}/api/posts`, postData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      setPostText(""); setSelectedPostMedia(null); setMediaFile(null);
      fetchPosts(); 
    } catch (err) { alert("Broadcast failed."); }
  };

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white pb-28 selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* ১. টপ হেডার (ছবি অনুযায়ী) */}
      <header className="sticky top-0 z-[100] bg-black/60 backdrop-blur-2xl border-b border-white/[0.03] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <HiOutlineMenuAlt4 size={24} className="text-gray-500" />
            <h1 className="text-xl font-black italic tracking-tighter uppercase">
              ONYX<span className="text-cyan-500">DRIFT</span>
            </h1>
        </div>
        <div className="flex items-center gap-5">
          <FaSearch size={18} className="text-gray-500" />
          <div className="relative">
            <FaRegBell size={20} className="text-gray-500" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-full border-2 border-black"></span>
          </div>
        </div>
      </header>

      {/* ২. স্টোরি সেকশন (Gradient Border Style) */}
      <section className="py-6 no-scrollbar overflow-x-auto">
        <div className="flex gap-5 px-6 items-center">
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="w-[68px] h-[68px] rounded-full border-2 border-dashed border-gray-800 flex items-center justify-center bg-[#050505] relative cursor-pointer active:scale-90 transition-all">
              <img src={user?.picture} className="w-[58px] h-[58px] rounded-full object-cover opacity-40" alt="" />
              <div className="absolute bottom-0 right-0 bg-white text-black rounded-full p-1 border-4 border-black">
                <FaPlus size={10} />
              </div>
            </div>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Story</span>
          </div>
          {/* স্যাম্পল স্টোরি */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer active:scale-95 transition-all">
              <div className="p-[2px] rounded-full bg-gradient-to-tr from-cyan-400 via-purple-500 to-rose-500">
                <div className="bg-black p-[2.5px] rounded-full">
                  <img src={`https://i.pravatar.cc/150?u=${i}`} className="w-[58px] h-[58px] rounded-full object-cover" alt="" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">User_{i}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ৩. পোস্ট ইনপুট বক্স (Black Focused Style) */}
      <section className="mx-5 mb-8">
        <div className={`transition-all duration-500 border rounded-[2rem] p-5 ${isFocused ? "bg-black border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]" : "bg-[#0A0A0A] border-white/5"}`}>
          <div className="flex gap-4">
            <img src={user?.picture} className="w-11 h-11 rounded-2xl object-cover border border-white/10" alt="" />
            <div className="flex-1">
              <textarea
                value={postText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full bg-transparent text-[15px] text-gray-200 placeholder-gray-600 outline-none resize-none min-h-[50px] pt-2"
              />
              
              <AnimatePresence>
                {selectedPostMedia && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 relative rounded-2xl overflow-hidden border border-white/10">
                    <button onClick={() => setSelectedPostMedia(null)} className="absolute top-2 right-2 p-2 bg-black/80 rounded-full text-white z-10"><FaTimes size={12}/></button>
                    {mediaType === 'video' ? <video src={selectedPostMedia} className="w-full max-h-[250px] object-cover" controls /> : <img src={selectedPostMedia} className="w-full max-h-[250px] object-cover" alt="" />}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={handleAICaption} className="self-start p-2 text-cyan-500/50 hover:text-cyan-400 transition-colors">
              <HiOutlineSparkles size={24} className={aiLoading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.03]">
            <div className="flex gap-3">
              <button onClick={() => postFileInputRef.current.click()} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-xl text-[11px] font-bold text-gray-500 transition-all">
                <FaImage className="text-orange-500/80" /> Photo
              </button>
              <button onClick={() => postFileInputRef.current.click()} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-xl text-[11px] font-bold text-gray-500 transition-all">
                <FaVideo className="text-cyan-500/80" /> Video
              </button>
            </div>
            <input type="file" ref={postFileInputRef} onChange={(e) => {
              const file = e.target.files[0];
              if(file) {
                setMediaFile(file);
                const reader = new FileReader();
                reader.onloadend = () => { setSelectedPostMedia(reader.result); setMediaType(file.type.startsWith('video') ? 'video' : 'image'); };
                reader.readAsDataURL(file);
              }
            }} hidden accept="image/*,video/*" />
            
            <button 
              disabled={!postText.trim() && !mediaFile}
              onClick={handlePostSubmit}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest disabled:opacity-10 transition-all flex items-center gap-2 shadow-lg shadow-cyan-900/20"
            >
              Post <FaPaperPlane size={10}/>
            </button>
          </div>
        </div>
      </section>

      {/* ৪. ফিড সেকশন */}
      <section className="px-5 space-y-6">
        <h2 className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-700 px-2">Neural Broadcasts</h2>
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3 opacity-20">
             <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
             <p className="text-[9px] font-black uppercase tracking-[0.3em]">Syncing...</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard 
              key={post._id || post.id} 
              post={post} 
              onDelete={() => {}} // original logic
              currentUserId={user?.sub} 
              onAction={fetchPosts} 
              onUserClick={(id) => navigate(`/profile/${id}`)} 
            />
          ))
        )}
      </section>
    </div>
  );
};

export default PremiumHomeFeed;
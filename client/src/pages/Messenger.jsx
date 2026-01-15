import React, { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiOutlinePhone, HiOutlineVideoCamera, HiOutlinePaperAirplane, 
  HiOutlineChatBubbleBottomCenterText, HiOutlineMicrophone, 
  HiOutlineChevronLeft, HiPlus, HiXMark, HiOutlineSparkles,
  HiOutlineMusicalNote, HiOutlineFaceSmile, HiOutlinePaintBrush,
  HiOutlineTextT, HiCheck, HiOutlinePlay, HiOutlinePause
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

const Messenger = () => {
  const { user, getAccessTokenSilently, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  
  // --- Chat States ---
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  
  // --- 📸 Story States ---
  const [allStories, setAllStories] = useState([]); 
  const [viewingStory, setViewingStory] = useState(null);
  const [selectedStoryFile, setSelectedStoryFile] = useState(null);
  const [isStoryUploading, setIsStoryUploading] = useState(false);
  const [activeTool, setActiveTool] = useState(null); 
  const [storySettings, setStorySettings] = useState({
    filter: "none",
    text: "",
    musicName: "",
    musicUrl: "",
    aiEnhance: false
  });

  const socket = useRef();
  const scrollRef = useRef();
  const audioRef = useRef(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const API_URL = "https://onyx-drift-app-final.onrender.com";

  // --- 🎵 ১০০টি ভাইরাল গানের লিস্ট (নমুনা হিসেবে কয়েকটি দেওয়া হলো) ---
  const viralSongs = [
    { name: "After Dark x Sweater Weather", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { name: "Cyberdrift 2077", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { name: "Nightcall - Kavinsky", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    { name: "Metamorphosis", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
    { name: "Starboy - The Weeknd", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
    { name: "Blinding Lights", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
    // আপনি চাইলে এখানে ১০০টি গানের অবজেক্ট এভাবে যোগ করতে পারেন
  ];

  // --- ১. স্টোরি ওপেন করা এবং মিউজিক প্লে করা ---
  const handleOpenStory = (story) => {
    // ১২ ঘণ্টা চেক করার লজিক (Client Side Check)
    const storyAge = (new Date() - new Date(story.createdAt)) / (1000 * 60 * 60);
    if (storyAge > 12) {
      alert("This story has expired (12h limit).");
      return;
    }

    setViewingStory(story);
    if (story.musicUrl) {
      audioRef.current.src = story.musicUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleCloseStory = () => {
    setViewingStory(null);
    audioRef.current.pause();
    setIsPlaying(false);
  };

  // --- ২. স্টোরি আপলোড (মিউজিক এবং টাইমার সহ) ---
  const handleStoryUpload = async () => {
    if (!selectedStoryFile) return;
    try {
      setIsStoryUploading(true);
      const token = await getAccessTokenSilently();
      const formData = new FormData();
      formData.append("media", selectedStoryFile);
      formData.append("text", storySettings.text);
      formData.append("music", storySettings.musicName);
      formData.append("musicUrl", storySettings.musicUrl);
      formData.append("filter", storySettings.filter);
      formData.append("isStory", "true");
      formData.append("createdAt", new Date().toISOString()); // ১২ ঘণ্টা টাইমার শুরু

      await axios.post(`${API_URL}/api/posts`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      setSelectedStoryFile(null);
      setStorySettings({ filter: "none", text: "", musicName: "", musicUrl: "", aiEnhance: false });
    } catch (err) {
      console.error("Transmission Failed", err);
    } finally {
      setIsStoryUploading(false);
    }
  };

  // --- Call/Chat Logic ---
  const handleCall = (type) => {
    if (!currentChat) return;
    navigate(`/call/${currentChat._id}?type=${type}`);
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { senderId: user.sub, text: newMessage }]);
    setNewMessage("");
  };

  useEffect(() => {
    if (isAuthenticated) {
      socket.current = io(API_URL, { transports: ["websocket"] });
      socket.current.on("getMessage", (data) => setMessages((prev) => [...prev, data]));
      if (user?.sub) socket.current.emit("addNewUser", user.sub);
      return () => socket.current.disconnect();
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-[#010409] text-white font-mono overflow-hidden fixed inset-0">
      
      {/* 🎬 STORY VIEWER MODAL */}
      <AnimatePresence>
        {viewingStory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[6000] bg-black flex items-center justify-center">
             <div className="relative w-full max-w-[420px] h-full md:h-[92vh] bg-zinc-900 overflow-hidden md:rounded-3xl">
                {/* Progress Bar */}
                <div className="absolute top-4 left-4 right-4 h-1 bg-white/20 z-50 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 15, ease: "linear" }} onAnimationComplete={handleCloseStory} className="h-full bg-cyan-500" />
                </div>
                
                <img src={viewingStory.mediaUrl} className="w-full h-full object-cover" alt="story" />
                
                <div className="absolute inset-0 flex flex-col justify-center items-center p-10 pointer-events-none">
                  <span className="bg-white text-black px-4 py-1 text-xl font-black uppercase italic pointer-events-auto">{viewingStory.text}</span>
                </div>

                <div className="absolute top-8 right-6 z-50">
                  <button onClick={handleCloseStory} className="p-2 bg-black/40 backdrop-blur-md rounded-full"><HiXMark size={24}/></button>
                </div>

                {viewingStory.musicName && (
                  <div className="absolute bottom-10 left-6 right-6 flex items-center gap-4 bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
                    <HiOutlineMusicalNote className="text-pink-500 animate-pulse" size={20} />
                    <div className="flex-1 overflow-hidden">
                       <p className="text-[10px] font-black uppercase tracking-widest truncate">{viewingStory.musicName}</p>
                    </div>
                  </div>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🟣 PART 1: STORY EDITOR */}
      <AnimatePresence>
        {selectedStoryFile && !viewingStory && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} 
            className="fixed inset-0 z-[5000] bg-black flex flex-col items-center justify-center p-0 md:p-4"
          >
            <div className="relative w-full max-w-[420px] h-full md:h-[92vh] bg-zinc-900 md:rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
              <img 
                src={URL.createObjectURL(selectedStoryFile)} 
                className={`w-full h-full object-cover transition-all duration-500 ${storySettings.aiEnhance ? 'saturate-150 contrast-110' : ''}`}
                style={{ 
                  filter: storySettings.filter === 'neon' ? 'hue-rotate(90deg) brightness(1.2)' : 
                          storySettings.filter === 'cyber' ? 'sepia(0.3) hue-rotate(250deg)' : 'none' 
                }}
                alt="preview"
              />

              {/* Editor Controls */}
              <div className="absolute top-8 left-0 right-0 px-6 flex justify-between items-center z-50">
                <button onClick={() => setSelectedStoryFile(null)} className="p-3 bg-black/40 backdrop-blur-xl rounded-full"><HiXMark size={24}/></button>
                <button onClick={handleStoryUpload} disabled={isStoryUploading} className="px-8 py-2.5 bg-white text-black font-black rounded-full text-[11px] tracking-widest uppercase">
                  {isStoryUploading ? "Syncing..." : "Share"}
                </button>
              </div>

              <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-50">
                <button onClick={() => setActiveTool('text')} className={`p-3.5 rounded-full backdrop-blur-2xl border ${activeTool==='text' ? 'bg-white text-black' : 'bg-black/40'}`}><HiOutlineTextT size={24}/></button>
                <button onClick={() => setActiveTool('music')} className={`p-3.5 rounded-full backdrop-blur-2xl border ${activeTool==='music' ? 'bg-pink-500 text-white' : 'bg-black/40'}`}><HiOutlineMusicalNote size={24}/></button>
                <button onClick={() => setActiveTool('filter')} className={`p-3.5 rounded-full backdrop-blur-2xl border ${activeTool==='filter' ? 'bg-cyan-500 text-black' : 'bg-black/40'}`}><HiOutlinePaintBrush size={24}/></button>
              </div>

              {/* Draggable Text Preview */}
              {storySettings.text && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white text-black px-5 py-2 text-xl font-black italic uppercase shadow-2xl">{storySettings.text}</span>
                </div>
              )}

              {/* Music Selection Menu */}
              <AnimatePresence>
                {activeTool === 'music' && (
                  <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} className="absolute bottom-0 w-full bg-black/95 backdrop-blur-3xl p-8 rounded-t-[2.5rem] border-t border-white/10 z-[60]">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-[11px] font-black text-white/50 tracking-widest uppercase">VIRAL AUDIO LIBRARY</h4>
                        <button onClick={() => setActiveTool(null)}><HiXMark/></button>
                    </div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {viralSongs.map(track => (
                        <button key={track.name} onClick={() => {setStorySettings({...storySettings, musicName: track.name, musicUrl: track.url}); setActiveTool(null);}} 
                          className="w-full flex justify-between items-center p-4 bg-white/5 rounded-2xl hover:bg-pink-500/20 transition-all text-[11px] font-bold uppercase">
                          {track.name} <HiCheck className={storySettings.musicName === track.name ? "text-pink-500" : "opacity-20"}/>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTool === 'filter' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-10 left-0 right-0 flex justify-center gap-4 z-[60]">
                    {['none', 'neon', 'cyber'].map(f => (
                      <button key={f} onClick={() => {setStorySettings({...storySettings, filter: f}); setActiveTool(null);}} 
                        className={`px-6 py-2 rounded-full text-[9px] font-black uppercase border-2 transition-all ${storySettings.filter === f ? 'bg-cyan-500 border-cyan-400 text-black shadow-lg shadow-cyan-500/40' : 'bg-black/40 border-white/20 text-white/40'}`}>
                        {f}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {activeTool === 'text' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/90 z-[70] flex flex-col items-center justify-center p-10">
                <input 
                  autoFocus className="bg-transparent border-none outline-none text-center text-4xl font-black uppercase text-white w-full"
                  placeholder="TYPE MESSAGE..."
                  value={storySettings.text}
                  onChange={(e) => setStorySettings({...storySettings, text: e.target.value})}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveTool(null)}
                />
                <button onClick={() => setActiveTool(null)} className="mt-12 px-10 py-3 bg-white text-black font-black rounded-full uppercase text-[11px]">Done</button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📡 PART 2: MESSENGER SIDEBAR */}
      <div className={`${currentChat ? 'hidden md:flex' : 'flex'} w-full md:w-[420px] bg-[#030712]/90 backdrop-blur-3xl border-r border-white/5 flex flex-col`}>
        <div className="p-8 pb-4">
          <h2 className="text-2xl font-black tracking-tighter italic bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-10">ONYX_NODES</h2>
          
          <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-6">
            <label className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group">
              <div className="w-16 h-16 rounded-[2.2rem] border-2 border-dashed border-white/10 flex items-center justify-center text-cyan-500 group-hover:border-cyan-500 transition-all duration-500">
                <HiPlus size={28} />
              </div>
              <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">Post</span>
              <input type="file" hidden accept="image/*" onChange={(e) => setSelectedStoryFile(e.target.files[0])} />
            </label>
            
            {/* Story Nodes - ক্লিক করলে handleOpenStory কল হবে */}
            {[1, 2, 3].map(i => (
              <div key={i} onClick={() => handleOpenStory({ 
                  mediaUrl: `https://i.pravatar.cc/500?img=${i+10}`, 
                  text: "Neural Update", 
                  musicName: "Cyberdrift 2077", 
                  musicUrl: viralSongs[1].url,
                  createdAt: new Date() 
                })} className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group">
                <div className="w-16 h-16 rounded-[2.2rem] p-[3px] bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-blue-500 group-hover:scale-110 transition-transform">
                  <div className="bg-black w-full h-full rounded-[2rem] p-1">
                    <img src={`https://i.pravatar.cc/150?img=${i+10}`} className="w-full h-full rounded-[1.8rem] object-cover" alt="story" />
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase text-white/20">Node_{i}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-3 custom-scrollbar">
          {conversations.map((c) => (
            <motion.div 
              key={c._id} 
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentChat(c)} 
              className={`p-6 rounded-[2.5rem] flex items-center gap-5 cursor-pointer transition-all border ${currentChat?._id === c._id ? 'bg-cyan-500 border-cyan-400 text-black shadow-2xl shadow-cyan-500/20' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
            >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${currentChat?._id === c._id ? 'bg-black text-cyan-500' : 'bg-zinc-800 text-white/20'}`}>
                  {c._id.slice(-2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm font-black uppercase tracking-tight ${currentChat?._id === c._id ? 'text-black' : 'text-white/90'}`}>Neural_Link_{c._id.slice(-4)}</h4>
                  <p className={`text-[10px] uppercase font-bold tracking-widest ${currentChat?._id === c._id ? 'text-black/60' : 'text-white/20'}`}>Live Uplink</p>
                </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ⚔️ PART 3: MAIN CHAT AREA */}
      <div className={`${!currentChat ? 'hidden md:flex' : 'flex'} flex-1 flex flex-col relative bg-[#010409]`}>
        {currentChat ? (
          <>
            <header className="px-10 py-8 flex justify-between items-center border-b border-white/5 backdrop-blur-3xl sticky top-0 z-20">
              <div className="flex items-center gap-6">
                <button onClick={() => setCurrentChat(null)} className="md:hidden text-cyan-400 p-2 bg-white/5 rounded-full"><HiOutlineChevronLeft size={24} /></button>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-3">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></span>
                    Terminal_{currentChat._id.slice(-4)}
                  </h3>
                  <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-1">E2E Quantum Encrypted</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => handleCall('audio')} className="p-4 bg-white/5 rounded-2xl hover:bg-cyan-500 hover:text-black transition-all group"><HiOutlinePhone size={22} /></button>
                <button onClick={() => handleCall('video')} className="p-4 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all group border border-white/5"><HiOutlineVideoCamera size={22} /></button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
              {messages.map((m, i) => (
                <motion.div initial={{ opacity: 0, x: m.senderId === user?.sub ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} key={i} className={`flex ${m.senderId === user?.sub ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-8 py-5 rounded-[2.2rem] border text-[13px] font-medium tracking-wide shadow-xl ${m.senderId === user?.sub ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-100 rounded-tr-none' : 'bg-zinc-900 border-white/10 text-white/80 rounded-tl-none'}`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              <div ref={scrollRef} />
            </div>

            <div className="p-10">
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-[3rem] border border-white/10 focus-within:border-cyan-500/50 transition-all group shadow-2xl">
                <button className="p-3 text-white/20 hover:text-cyan-500 transition-colors"><HiOutlineMicrophone size={24} /></button>
                <input 
                   value={newMessage} 
                   onChange={(e) => setNewMessage(e.target.value)} 
                   onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                   placeholder="Transmit message..." 
                   className="flex-1 bg-transparent border-none outline-none text-[13px] font-bold tracking-wider placeholder:text-white/5" 
                />
                <button onClick={handleSend} className="p-5 bg-cyan-500 rounded-full text-black shadow-lg shadow-cyan-500/40 hover:scale-110 active:scale-90 transition-all">
                   <HiOutlinePaperAirplane size={22} className="rotate-45" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center relative bg-[#010409]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03)_0%,transparent_70%)]"></div>
            <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                <HiOutlineChatBubbleBottomCenterText size={120} className="text-white/5 mb-8" />
            </motion.div>
            <p className="text-[10px] font-black tracking-[1.5em] text-white/10 uppercase">Select_Neural_Node</p>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Messenger;
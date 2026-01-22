import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  HiMagnifyingGlass, HiOutlineCamera, HiPlus,
  HiChatBubbleLeftRight, HiUsers, HiCog6Tooth,
  HiOutlineChevronLeft, HiOutlinePhone, HiOutlineVideoCamera,
  HiOutlineEllipsisVertical, HiOutlinePaperAirplane,
  HiUserGroup // গ্রুপের জন্য নতুন আইকন
} from "react-icons/hi2";
import { AnimatePresence, motion } from "framer-motion";

// কম্পোনেন্ট ইমপোর্ট
import StorySection from "../components/Messenger/StorySection";
import ChatInput from "../components/Messenger/ChatInput";
import CallOverlay from "../components/Messenger/CallOverlay";
import StoryEditor from "../components/Messenger/StoryEditor";

const Messenger = ({ socket }) => {
  const { user, getAccessTokenSilently, isAuthenticated, logout } = useAuth0();
  const navigate = useNavigate();

  // --- STATES ---
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("chats");
  const [isTyping, setIsTyping] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [tempStoryFile, setTempStoryFile] = useState(null); 
  const [isUploading, setIsUploading] = useState(false);

  const ringtoneRef = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3"));
  const scrollRef = useRef();
  const typingTimeoutRef = useRef(null);
  const storyInputRef = useRef(null);
  const API_URL = "https://onyx-drift-app-final.onrender.com";

  /* =================📡 REAL-TIME SIGNALS (Socket.io) ================= */
  useEffect(() => {
    const s = socket?.current || socket;
    if (!s || !user?.sub) return;

    s.emit("addNewUser", user.sub);
    s.on("getUsers", (users) => setActiveUsers(users));

    s.on("getMessage", (data) => {
      // যদি মেসেজটি বর্তমান চ্যাটের হয় তবেই লিস্টে দেখাবে
      if (currentChat?._id === data.conversationId) {
        setMessages((prev) => [...prev, data]);
      }
      fetchConversations(); // লিস্ট আপডেট করার জন্য
    });

    // গ্রুপ কলের ইনকামিং সিগন্যাল রিসিভ করা
    s.on("incomingGroupCall", (data) => {
      setIncomingCall({ ...data, isGroup: true });
      ringtoneRef.current.play().catch(() => {});
    });

    return () => { 
      s.off("getUsers"); 
      s.off("getMessage"); 
      s.off("incomingGroupCall");
    };
  }, [socket, currentChat, user]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  /* =================📦 DATA FETCHING ================= */
  const fetchConversations = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      const res = await axios.get(`${API_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
    } catch (err) { console.error("Signal Fetch Failed", err); }
  }, [getAccessTokenSilently]);

  useEffect(() => { if (isAuthenticated) fetchConversations(); }, [isAuthenticated, fetchConversations]);

  /* =================✉️ ACTION HANDLERS ================= */
  const handleSend = async () => {
    if (!newMessage.trim() || !currentChat) return;
    
    const s = socket?.current || socket;
    const msgData = {
      senderId: user.sub,
      senderName: user.name,
      text: newMessage,
      conversationId: currentChat._id,
      isGroup: currentChat.isGroup || false,
      members: currentChat.members // সকেট যাতে সবাইকে পাঠাতে পারে
    };

    // লোকাললি আপডেট
    setMessages((prev) => [...prev, msgData]);
    setNewMessage("");

    // সকেটে পাঠানো (গ্রুপ বা সিঙ্গেল সবার জন্য)
    if (s) s.emit("sendMessage", msgData);

    try {
      const token = await getAccessTokenSilently();
      await axios.post(`${API_URL}/api/messages/message`, msgData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) { console.log("Database Sync Error"); }
  };

  // ভিডিও কল হ্যান্ডলার (একক ও গ্রুপ)
  const initiateCall = (type) => {
    if (!currentChat) return;
    const s = socket?.current || socket;
    const roomId = currentChat._id;

    if (s) {
      if (currentChat.isGroup) {
        // গ্রুপ কলের জন্য আলাদা ইভেন্ট
        s.emit("startGroupCall", {
          roomId,
          participants: currentChat.members.filter(m => m !== user.sub),
          senderName: user.name,
          type
        });
      } else {
        // সিঙ্গেল কলের জন্য
        const receiverId = currentChat.members.find(m => m !== user.sub);
        s.emit("callUser", { userToCall: receiverId, from: user.sub, senderName: user.name, type, roomId });
      }
    }
    navigate(`/call/${roomId}?mode=${currentChat.isGroup ? 'group' : 'private'}`);
  };

  return (
    <div className="fixed inset-0 bg-[#050505] text-white font-sans overflow-hidden z-[99999]">
      <input type="file" ref={storyInputRef} onChange={(e) => setTempStoryFile(e.target.files[0])} className="hidden" accept="image/*,video/*" />

      {/* --- LIST VIEW --- */}
      <div className={`flex flex-col h-full w-full ${currentChat ? 'hidden md:flex' : 'flex'}`}>
        <header className="p-6 flex justify-between items-center bg-black/20 backdrop-blur-xl border-b border-white/5 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="relative group p-0.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full">
              <img src={user?.picture} className="w-11 h-11 rounded-full object-cover border-2 border-black" alt="me" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter italic text-cyan-500">ONYX<span className="text-white">DRIFT</span></h1>
          </div>
          <button className="p-3 bg-zinc-900 rounded-2xl text-white border border-white/5 active:scale-90 transition-all">
            <HiPlus size={24}/>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto pb-28 no-scrollbar">
          {activeTab === "chats" && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <div className="px-6 my-4">
                <div className="bg-[#111] rounded-2xl py-3.5 px-5 flex items-center gap-3 border border-white/5">
                   <HiMagnifyingGlass className="text-zinc-600" />
                   <input type="text" placeholder="Search neural links..." className="bg-transparent outline-none w-full text-sm" />
                </div>
              </div>

              <div className="px-2"><StorySection activeUsers={activeUsers} user={user} storyInputRef={storyInputRef} /></div>

              <div className="mt-4 px-4 space-y-2">
                {conversations.map(c => (
                  <div key={c._id} onClick={() => setCurrentChat(c)} className="p-4 flex items-center gap-4 hover:bg-zinc-900/40 rounded-[2rem] transition-all border border-transparent hover:border-white/5 cursor-pointer">
                      <div className="relative">
                        {c.isGroup ? (
                          <div className="w-14 h-14 rounded-[1.4rem] bg-gradient-to-br from-cyan-900/40 to-blue-900/40 flex items-center justify-center border border-cyan-500/30">
                            <HiUserGroup size={28} className="text-cyan-400" />
                          </div>
                        ) : (
                          <img src={c.userDetails?.avatar} className="w-14 h-14 rounded-[1.4rem] object-cover" alt="" />
                        )}
                        {!c.isGroup && activeUsers.some(au => c.members.includes(au.userId) && au.userId !== user?.sub) && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-[4px] border-[#050505] rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-0.5">
                           <span className="font-bold text-[16px]">{c.isGroup ? (c.groupName || "Onyx Group") : c.userDetails?.name}</span>
                           <span className="text-[10px] text-zinc-600 font-black">STABLE</span>
                        </div>
                        <p className="text-[12px] text-zinc-500 truncate">{c.isGroup ? `${c.members.length} members connected` : "Secured neural tunnel active"}</p>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- DOCK NAVIGATION --- */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] h-20 bg-[#111]/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 flex justify-around items-center z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
           <button onClick={() => setActiveTab("chats")} className={`p-4 rounded-full transition-all ${activeTab === "chats" ? 'text-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'text-zinc-600'}`}><HiChatBubbleLeftRight size={28} /></button>
           <button onClick={() => setActiveTab("stories")} className={`p-4 transition-all ${activeTab === "stories" ? 'text-cyan-500' : 'text-zinc-600'}`}><HiUsers size={28} /></button>
           <button onClick={() => setActiveTab("settings")} className={`p-4 transition-all ${activeTab === "settings" ? 'text-cyan-500' : 'text-zinc-600'}`}><HiCog6Tooth size={28} /></button>
        </div>
      </div>

      {/* --- FULL SCREEN CHAT & CALL UI --- */}
      <AnimatePresence>
      {currentChat && (
        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed inset-0 bg-[#050505] z-[200] flex flex-col">
           <header className="p-4 flex justify-between items-center border-b border-white/5 bg-black/60 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                 <button onClick={() => setCurrentChat(null)} className="text-zinc-400 p-2"><HiOutlineChevronLeft size={30}/></button>
                 <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-900 border border-white/10">
                    {currentChat.isGroup ? <HiUserGroup size={24} className="m-2 text-cyan-500" /> : <img src={currentChat.userDetails?.avatar} className="w-full h-full object-cover" alt="" />}
                 </div>
                 <div>
                    <h3 className="text-[15px] font-bold">{currentChat.isGroup ? currentChat.groupName : currentChat.userDetails?.name}</h3>
                    <div className="flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-500">{currentChat.isGroup ? "Group Active" : "Private Link"}</span>
                    </div>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => initiateCall('video')} className="p-3 text-cyan-500 bg-cyan-500/10 rounded-2xl hover:bg-cyan-500/20 transition-all">
                    <HiOutlineVideoCamera size={24}/>
                 </button>
                 <button className="p-3 text-zinc-400"><HiOutlineEllipsisVertical size={24}/></button>
              </div>
           </header>
           
           <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.senderId === user?.sub ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex flex-col max-w-[85%]">
                    {currentChat.isGroup && m.senderId !== user?.sub && (
                      <span className="text-[10px] text-zinc-500 font-bold ml-2 mb-1 uppercase tracking-tighter">{m.senderName}</span>
                    )}
                    <div className={`px-5 py-3 rounded-[1.8rem] text-[15px] shadow-2xl ${m.senderId === user?.sub 
                      ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-tr-none' 
                      : 'bg-zinc-900 text-zinc-100 rounded-tl-none border border-white/5'}`}>
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
           </div>

           <div className="p-4 pb-10 bg-black/60 border-t border-white/5 backdrop-blur-xl">
              <div className="flex items-center gap-3 bg-[#111] p-2 rounded-[2.5rem] border border-white/10 focus-within:border-cyan-500/50 transition-all">
                 <button className="p-3 text-zinc-600 hover:text-cyan-400"><HiPlus size={24}/></button>
                 <input 
                  type="text" 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Transmit signal..." 
                  className="bg-transparent flex-1 outline-none text-[15px] text-white" 
                 />
                 <button onClick={handleSend} className="p-3.5 bg-cyan-500 text-black rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-95 transition-all">
                    <HiOutlinePaperAirplane size={22} className="-rotate-45" />
                 </button>
              </div>
           </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* --- OVERLAYS --- */}
      <CallOverlay incomingCall={incomingCall} setIncomingCall={setIncomingCall} ringtoneRef={ringtoneRef} navigate={navigate} />
      
      {/* স্টোরি ও আপলোড লোডার আগের মতোই থাকবে */}
      <AnimatePresence>
        {tempStoryFile && <StoryEditor selectedFile={tempStoryFile} onCancel={() => setTempStoryFile(null)} onPost={handlePostStory} isUploading={isUploading} />}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Messenger;
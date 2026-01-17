import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiOutlinePhone, HiOutlineVideoCamera, HiOutlinePaperAirplane, 
  HiOutlineChevronLeft, HiPlus, HiXMark, HiMagnifyingGlass,
  HiOutlineInformationCircle, HiOutlinePhoto, HiOutlineMicrophone,
  HiOutlineCamera, HiOutlineTrash, HiOutlineEye
} from "react-icons/hi2";

const Messenger = ({ socket }) => { 
  const { user, getAccessTokenSilently, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeUsers, setActiveUsers] = useState([]); // অনলাইনে থাকা ইউজারদের জন্য
  const [stories, setStories] = useState([]); // স্টোরি ডাটার জন্য
  const [selectedStory, setSelectedStory] = useState(null); // স্টোরি ভিউয়ারের জন্য
  const [isTyping, setIsTyping] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  const ringtoneRef = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3"));
  const scrollRef = useRef();
  const typingTimeoutRef = useRef(null);
  const API_URL = "https://onyx-drift-app-final.onrender.com";

  /* =================📡 SOCKET LOGIC ================= */
  useEffect(() => {
    const s = socket?.current || socket;
    if (!s || !user?.sub) return;

    s.emit("addNewUser", user.sub);

    // অ্যাক্টিভ ইউজারদের লিস্ট আপডেট করা
    s.on("getUsers", (users) => {
      setActiveUsers(users);
    });

    const handleMessage = (data) => {
      setMessages((prev) => {
        const isDuplicate = prev.some(m => (m.tempId && m.tempId === data.tempId) || (m._id && m._id === data._id));
        if (isDuplicate) return prev;
        return [...prev, data];
      });
    };

    const handleTyping = (data) => {
      if (currentChat?.members?.includes(data.senderId)) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    };

    const handleIncomingCall = (data) => {
      setIncomingCall(data);
      ringtoneRef.current.loop = true;
      ringtoneRef.current.play().catch(e => console.log("Audio play blocked"));
    };

    s.on("getMessage", handleMessage);
    s.on("displayTyping", handleTyping);
    s.on("incomingCall", handleIncomingCall);

    return () => {
      s.off("getUsers");
      s.off("getMessage");
      s.off("displayTyping");
      s.off("incomingCall");
    };
  }, [socket, currentChat, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* =================✉️ HANDLERS ================= */
  const handleSend = async () => {
    if (!newMessage.trim() || !currentChat) return;
    const receiverId = currentChat.members.find(m => m !== user.sub);
    const s = socket?.current || socket;
    const tempId = `temp_${Date.now()}`;

    const msgData = {
      tempId, senderId: user.sub, receiverId, text: newMessage,
      conversationId: currentChat._id, createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, msgData]);
    setNewMessage("");
    if (s) s.emit("sendMessage", msgData);

    try {
      const token = await getAccessTokenSilently();
      await axios.post(`${API_URL}/api/messages/message`, msgData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) { console.error("Sync failed", err); }
  };

  /* =================📱 STORY LOGIC ================= */
  // স্টোরি আপলোড করার ফাংশন (স্যাম্পল)
  const handleStoryUpload = () => {
    alert("Story Upload Logic: এখান থেকে গ্যালারি ওপেন করে ফাইল আপলোড হবে।");
  };

  // স্টোরি ডিলিট করা
  const deleteStory = (storyId) => {
    setStories(stories.filter(s => s.id !== storyId));
    setSelectedStory(null);
  };

  /* =================📥 DATA FETCHING ================= */
  const fetchConversations = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      const res = await axios.get(`${API_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
    } catch (err) { console.error(err); }
  }, [getAccessTokenSilently, API_URL]);

  useEffect(() => { if (isAuthenticated) fetchConversations(); }, [isAuthenticated, fetchConversations]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat) return;
      try {
        const token = await getAccessTokenSilently();
        const res = await axios.get(`${API_URL}/api/messages/message/${currentChat._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (err) { console.error(err); }
    };
    fetchMessages();
  }, [currentChat, getAccessTokenSilently, API_URL]);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden fixed inset-0 font-sans z-[99999]">
      
      {/* --- SIDEBAR (Chat List) --- */}
      <div className={`${currentChat ? 'hidden md:flex' : 'flex'} w-full md:w-[360px] border-r border-zinc-800 flex flex-col bg-black`}>
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold overflow-hidden border border-zinc-700">
                 <img src={user?.picture} alt="" />
               </div>
               <h1 className="text-2xl font-bold tracking-tight">Chats</h1>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-all active:scale-90"><HiOutlineCamera size={22}/></button>
              <button className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-all active:scale-90"><HiPlus size={22}/></button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" placeholder="Search" 
              className="w-full bg-zinc-900 rounded-full py-2 pl-10 pr-4 outline-none text-sm border border-transparent focus:border-zinc-700"
            />
          </div>

          {/* Active Users & Story Bar */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
            {/* My Story / Upload */}
            <div onClick={handleStoryUpload} className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer group">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border border-zinc-700 flex items-center justify-center bg-zinc-900 overflow-hidden">
                  <img src={user?.picture} className="w-full h-full object-cover opacity-50" alt=""/>
                  <HiPlus className="absolute text-white" size={20} />
                </div>
              </div>
              <span className="text-[11px] text-zinc-400">Your Story</span>
            </div>

            {/* Online/Active Users Only */}
            {activeUsers.filter(u => u.userId !== user?.sub).map((active, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedStory({ name: `User_${i}`, image: `https://i.pravatar.cc/150?u=${active.userId}` })}
                className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer active:scale-95 transition-all"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-2 border-blue-600 p-0.5">
                    <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${active.userId}`} className="w-full h-full rounded-full object-cover bg-zinc-800" alt=""/>
                  </div>
                  <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full"></div>
                </div>
                <span className="text-[11px] text-zinc-300 truncate w-full text-center">Active_{i}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <div key={c._id} onClick={() => setCurrentChat(c)} className={`mx-2 px-3 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${currentChat?._id === c._id ? 'bg-zinc-900' : 'hover:bg-zinc-900/50'}`}>
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-zinc-800 overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c._id}`} alt=""/>
                </div>
                {/* Check if user in conversation is active */}
                {activeUsers.some(au => c.members.includes(au.userId) && au.userId !== user?.sub) && (
                   <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                   <span className="text-[15px] font-semibold truncate w-32">Node_{c._id.slice(-6)}</span>
                   <span className="text-[12px] text-zinc-500">Just now</span>
                </div>
                <p className="text-[13px] text-zinc-500 truncate">Last message here...</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MAIN CHAT AREA --- */}
      <div className={`${!currentChat ? 'hidden md:flex' : 'flex'} flex-1 flex flex-col bg-black relative`}>
        {currentChat ? (
          <>
            <header className="px-4 py-3 flex justify-between items-center border-b border-zinc-800 z-20 bg-black">
              <div className="flex items-center gap-3">
                <button onClick={() => setCurrentChat(null)} className="md:hidden text-blue-500"><HiOutlineChevronLeft size={28} /></button>
                <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentChat._id}`} alt=""/>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold leading-none">Node_{currentChat._id.slice(-6)}</h3>
                  <span className="text-[12px] text-green-500 font-medium">Active now</span>
                </div>
              </div>
              <div className="flex gap-4 text-blue-500">
                <button onClick={() => handleCall('voice')} className="p-2 active:bg-zinc-800 rounded-full"><HiOutlinePhone size={24} /></button>
                <button onClick={() => handleCall('video')} className="p-2 active:bg-zinc-800 rounded-full"><HiOutlineVideoCamera size={24} /></button>
                <button className="p-2 active:bg-zinc-800 rounded-full"><HiOutlineInformationCircle size={24} /></button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.senderId === user?.sub ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2 rounded-[20px] text-[15px] ${
                    m.senderId === user?.sub ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-white'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[11px] text-zinc-500 italic ml-2">Typing...</div>}
              <div ref={scrollRef} />
            </div>

            <div className="p-3 flex items-center gap-2 bg-black">
              <button className="text-blue-500 p-1"><HiPlus size={24}/></button>
              <button className="text-blue-500 p-1"><HiOutlineCamera size={24}/></button>
              <button className="text-blue-500 p-1"><HiOutlinePhoto size={24}/></button>
              <div className="flex-1 bg-zinc-900 rounded-full px-4 py-2 flex items-center border border-zinc-800">
                <input 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Aa" 
                  className="bg-transparent flex-1 outline-none text-[15px]" 
                />
                <span className="text-blue-500 text-xl cursor-pointer">😊</span>
              </div>
              <button onClick={handleSend} disabled={!newMessage.trim()} className={`${newMessage.trim() ? 'text-blue-500' : 'text-zinc-700'} p-1`}>
                <HiOutlinePaperAirplane size={24}/>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black">
            <div className="w-20 h-20 bg-zinc-800/30 rounded-full flex items-center justify-center mb-4">
               <HiOutlinePhone size={40} className="text-zinc-800" />
            </div>
            <h2 className="text-xl font-bold text-zinc-500">No Chat Selected</h2>
            <p className="text-sm">Choose a contact to start messaging</p>
          </div>
        )}
      </div>

      {/* --- 🎬 STORY VIEWER MODAL --- */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100000] bg-black flex flex-col items-center justify-center"
          >
            <div className="absolute top-5 left-0 right-0 px-5 flex justify-between items-center z-50">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-zinc-700">
                     <img src={selectedStory.image} className="rounded-full" alt=""/>
                  </div>
                  <span className="font-bold">{selectedStory.name}</span>
               </div>
               <button onClick={() => setSelectedStory(null)} className="p-2 bg-zinc-800 rounded-full"><HiXMark size={24}/></button>
            </div>
            
            {/* Story Content Area */}
            <div className="relative w-full max-w-lg aspect-[9/16] bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
               <img src={selectedStory.image} className="w-full h-full object-cover" alt=""/>
               {/* Progress Bar Mock */}
               <div className="absolute top-2 left-2 right-2 flex gap-1 h-1">
                  <div className="flex-1 bg-white rounded-full"></div>
                  <div className="flex-1 bg-white/20 rounded-full"></div>
               </div>
            </div>

            {/* Admin Options for story (Visible if you're the owner) */}
            <div className="mt-8 flex gap-5">
               <button className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white"><HiOutlineEye size={24}/> <span className="text-[10px]">24 Views</span></button>
               <button onClick={() => deleteStory(1)} className="flex flex-col items-center gap-1 text-red-500 hover:text-red-400"><HiOutlineTrash size={24}/> <span className="text-[10px]">Delete</span></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- 📞 CALL UI --- */}
      <AnimatePresence>
        {incomingCall && (
          <div className="fixed inset-0 z-[100001] bg-zinc-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-white">
             <div className="w-24 h-24 rounded-full bg-blue-500 mb-8 overflow-hidden border-4 border-blue-400 animate-pulse">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${incomingCall.senderName}`} alt=""/>
             </div>
             <h2 className="text-2xl font-bold">{incomingCall.senderName}</h2>
             <p className="text-zinc-400 mt-2">Messenger call...</p>
             <div className="flex gap-16 mt-32">
                <button onClick={() => { ringtoneRef.current.pause(); setIncomingCall(null); }} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all"><HiXMark size={32}/></button>
                <button onClick={() => { ringtoneRef.current.pause(); navigate(`/call/${incomingCall.roomId}`); setIncomingCall(null); }} className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-2xl shadow-green-500/50"><HiOutlinePhone size={32}/></button>
             </div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        input::placeholder { color: #555; }
      `}</style>
    </div>
  );
};

export default Messenger;
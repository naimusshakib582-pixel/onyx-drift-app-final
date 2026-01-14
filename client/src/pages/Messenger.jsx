import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiOutlinePhone, HiOutlineVideoCamera, HiOutlinePaperAirplane, 
  HiCheck, HiOutlineMagnifyingGlass, HiOutlineTrash,
  HiOutlineChatBubbleBottomCenterText, HiOutlineMicrophone,
  HiOutlineChevronLeft, HiOutlineStop, HiOutlineEllipsisVertical,
  HiPlus
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useReactMediaRecorder } from "react-media-recorder";

const Messenger = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const socket = useRef();
  const scrollRef = useRef();
  const typingTimeoutRef = useRef(null);
  const API_URL = "https://onyx-drift-app-final.onrender.com";

  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = 
    useReactMediaRecorder({ audio: true, blobPropertyBag: { type: "audio/wav" } });

  const neonText = "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-black";

  // --- Story Data (Simulated) ---
  const stories = [
    { id: 'me', name: "You", img: user?.picture, isMe: true },
    { id: '1', name: "Node_A1", img: "https://i.pravatar.cc/150?u=a1" },
    { id: '2', name: "Node_X9", img: "https://i.pravatar.cc/150?u=x9" },
    { id: '3', name: "Node_B5", img: "https://i.pravatar.cc/150?u=b5" },
    { id: '4', name: "Node_Z2", img: "https://i.pravatar.cc/150?u=z2" },
  ];

  // --- Socket.io Setup ---
  useEffect(() => {
    socket.current = io(API_URL, { transports: ["websocket"] });

    socket.current.on("getMessage", (data) => {
      setMessages((prev) => [...prev, data]);
      if (currentChat?._id === data.conversationId) {
        socket.current.emit("messageSeen", { messageId: data._id, senderId: data.senderId, receiverId: user.sub });
      }
    });

    socket.current.on("getOnlineUsers", (users) => setOnlineUsers(users));
    socket.current.on("displayTyping", (data) => { if (currentChat?.members.includes(data.senderId)) setRemoteTyping(true); });
    socket.current.on("hideTyping", () => setRemoteTyping(false));
    socket.current.on("messageSeenUpdate", ({ messageId }) => {
      setMessages((prev) => prev.map(m => m._id === messageId ? { ...m, seen: true } : m));
    });

    socket.current.on("messageDeleted", (messageId) => {
      setMessages((prev) => prev.filter(m => m._id !== messageId));
    });

    if (user?.sub) socket.current.emit("addNewUser", user.sub);
    return () => socket.current.disconnect();
  }, [user, currentChat]);

  // --- Delete Message Logic ---
  const deleteMessage = async (messageId, type) => {
    try {
      const receiverId = currentChat.members.find(m => m !== user.sub);
      if (type === "everyone") {
        await axios.delete(`${API_URL}/api/messages/${messageId}`);
        socket.current.emit("deleteMessage", { messageId, receiverId });
      }
      setMessages((prev) => prev.filter(m => m._id !== messageId));
      setActiveMenu(null);
    } catch (err) { console.error("Deletion failed", err); }
  };

  // --- Fetch Conversations ---
  const fetchConv = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      const res = await axios.get(`${API_URL}/api/messages/conversation/${user?.sub}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data || []);
    } catch (err) { console.error(err); }
  }, [user?.sub, getAccessTokenSilently]);

  useEffect(() => { if (user?.sub) fetchConv(); }, [user?.sub, fetchConv]);

  // --- Typing Logic ---
  const handleTypingEffect = (e) => {
    setNewMessage(e.target.value);
    if (!currentChat) return;
    const receiverId = currentChat.members.find(m => m !== user.sub);
    socket.current.emit("typing", { receiverId, senderId: user.sub });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socket.current.emit("stopTyping", { receiverId }), 2000);
  };

  // --- Send Logic ---
  const handleSend = async () => {
    if (!newMessage.trim() || !currentChat) return;
    const receiverId = currentChat.members.find(m => m !== user.sub);
    const messageBody = { conversationId: currentChat._id, senderId: user.sub, text: newMessage };
    try {
      const res = await axios.post(`${API_URL}/api/messages/message`, messageBody);
      socket.current.emit("sendMessage", { ...res.data, receiverId });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) { console.error(err); }
  };

  const sendVoiceMessage = async () => {
    if (!mediaBlobUrl) return;
    setIsUploadingVoice(true);
    try {
      const audioBlob = await fetch(mediaBlobUrl).then(r => r.blob());
      const formData = new FormData();
      formData.append("file", audioBlob);
      const uploadRes = await axios.post(`${API_URL}/api/upload`, formData);
      const receiverId = currentChat.members.find(m => m !== user.sub);
      const res = await axios.post(`${API_URL}/api/messages/message`, { 
        conversationId: currentChat._id, senderId: user.sub, 
        text: "🎤 Voice Message", audioUrl: uploadRes.data.filePath, messageType: "audio" 
      });
      socket.current.emit("sendMessage", { ...res.data, receiverId });
      setMessages((prev) => [...prev, res.data]);
      clearBlobUrl();
    } catch (err) { console.error(err); } finally { setIsUploadingVoice(false); }
  };

  useEffect(() => {
    if (currentChat) {
      axios.get(`${API_URL}/api/messages/message/${currentChat._id}`).then(res => setMessages(res.data));
    }
  }, [currentChat]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, remoteTyping]);

  return (
    <div className="flex h-screen bg-[#010409] text-white p-0 md:p-6 gap-0 md:gap-6 font-mono overflow-hidden fixed inset-0">
      
      {/* 📡 Chat List Section */}
      <div className={`${currentChat ? 'hidden md:flex' : 'flex'} w-full md:w-[380px] bg-[#030712]/60 backdrop-blur-2xl border border-white/[0.08] md:rounded-[3rem] flex flex-col overflow-hidden`}>
        <div className="p-8 pb-4">
          <h2 className={`text-xl tracking-widest uppercase mb-6 ${neonText}`}>Onyx_Nodes</h2>
          
          {/* 🚀 NEURAL STORY BAR */}
          <div className="flex gap-4 overflow-x-auto hide-scrollbar py-2 mb-4">
            {stories.map((story) => (
              <div key={story.id} className="flex flex-col items-center gap-2 shrink-0">
                <div className={`relative p-[2px] rounded-2xl ${story.isMe ? 'border border-dashed border-white/20' : 'bg-gradient-to-tr from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]'}`}>
                  <div className="bg-[#030712] rounded-[14px] p-[2px]">
                    <img src={story.img} className="w-12 h-12 rounded-xl object-cover grayscale-[0.3] hover:grayscale-0 transition-all cursor-pointer" alt="node" />
                  </div>
                  {story.isMe && (
                    <div className="absolute -bottom-1 -right-1 bg-cyan-500 rounded-full p-0.5 text-black border-2 border-[#030712]">
                      <HiPlus size={10} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <span className="text-[8px] font-black uppercase tracking-tighter text-white/40">{story.name}</span>
              </div>
            ))}
          </div>
          <div className="h-[1px] bg-white/5 w-full mb-4" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-3 custom-scrollbar">
          {conversations.map((c) => (
            <div key={c._id} onClick={() => setCurrentChat(c)} className={`p-5 rounded-[2.5rem] flex items-center gap-4 cursor-pointer transition-all ${currentChat?._id === c._id ? 'bg-cyan-500/10 border border-cyan-500/20' : 'hover:bg-white/5'}`}>
               <div className="w-12 h-12 rounded-2xl bg-gray-800 border border-white/10 flex items-center justify-center text-cyan-500/50 font-black text-xs">
                 {c._id.slice(-2).toUpperCase()}
               </div>
               <div className="flex-1">
                 <h4 className="text-xs font-black uppercase tracking-widest text-white/80">Node_{c._id.slice(-6)}</h4>
                 <p className="text-[9px] text-white/20 uppercase mt-0.5">Signal Encrypted</p>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* ⚔️ Main Chat Area */}
      <div className={`${!currentChat ? 'hidden md:flex' : 'flex'} flex-1 bg-[#030712]/60 backdrop-blur-2xl border border-white/[0.08] md:rounded-[3.5rem] flex flex-col relative overflow-hidden`}>
        {currentChat ? (
          <>
            <header className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-[#010409]/40 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <button onClick={() => setCurrentChat(null)} className="md:hidden text-cyan-400"><HiOutlineChevronLeft size={24} /></button>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[10px] text-cyan-400 font-black">
                  {currentChat._id.slice(-2).toUpperCase()}
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em]">Channel: {currentChat._id.slice(-6)}</h3>
              </div>
              <div className="flex gap-4 text-white/40">
                <HiOutlinePhone size={18} className="hover:text-cyan-400 cursor-pointer transition-colors" />
                <HiOutlineVideoCamera size={18} className="hover:text-cyan-400 cursor-pointer transition-colors" />
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar" onClick={() => setActiveMenu(null)}>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.senderId === user?.sub ? 'justify-end' : 'justify-start'}`}>
                  <div className="relative group flex flex-col max-w-[80%]">
                    <div className={`px-5 py-3 rounded-2xl border transition-all ${m.senderId === user?.sub ? 'bg-cyan-500/10 border-cyan-500/20 rounded-tr-none' : 'bg-white/5 border-white/10 rounded-tl-none'}`}>
                      {m.messageType === "audio" ? <audio src={m.audioUrl} controls className="h-8 w-44 brightness-125" /> : <p className="text-[12px] leading-relaxed tracking-wide">{m.text}</p>}
                      <div className="flex items-center justify-end gap-1 mt-1">
                         <span className="text-[7px] opacity-40 uppercase">{new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                         {m.senderId === user?.sub && <div className="flex"><HiCheck size={10} className={m.seen ? "text-cyan-400" : "text-gray-600"} /><HiCheck size={10} className={m.seen ? "text-cyan-400 -ml-1.5" : "hidden"} /></div>}
                      </div>
                    </div>
                    
                    <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === m._id ? null : m._id); }} className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 p-1 bg-gray-900 rounded-full border border-white/10 text-gray-500 hover:text-white transition-all shadow-xl">
                      <HiOutlineEllipsisVertical size={14} />
                    </button>

                    {activeMenu === m._id && (
                      <div className="absolute top-4 right-0 z-50 bg-[#0a0f1a] border border-white/10 rounded-xl py-2 shadow-2xl min-w-[120px] backdrop-blur-xl">
                        <button onClick={() => deleteMessage(m._id, 'me')} className="w-full text-left px-4 py-2 text-[10px] hover:bg-white/5 flex items-center gap-2"><HiOutlineTrash size={12}/> Delete for me</button>
                        {m.senderId === user?.sub && <button onClick={() => deleteMessage(m._id, 'everyone')} className="w-full text-left px-4 py-2 text-[10px] text-red-400 hover:bg-red-500/10 flex items-center gap-2"><HiOutlineTrash size={12}/> Delete for all</button>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {remoteTyping && <div className="text-[10px] text-cyan-500 animate-pulse font-black uppercase tracking-[0.2em] ml-2">Neural connection typing...</div>}
              <div ref={scrollRef} />
            </div>

            <div className="p-8">
              <div className="flex items-center gap-3 bg-white/5 p-2 rounded-[2rem] border border-white/10 backdrop-blur-md">
                {status === "recording" ? (
                  <div className="flex-1 flex items-center px-6 gap-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /><span className="text-[9px] text-red-500 font-black uppercase tracking-widest">Recording Audio...</span>
                    <button onClick={stopRecording} className="ml-auto text-red-500 hover:scale-110 transition-transform"><HiOutlineStop size={20} /></button>
                  </div>
                ) : (
                  <>
                    <button onClick={startRecording} className="p-3 text-gray-500 hover:text-cyan-400 transition-colors"><HiOutlineMicrophone size={22} /></button>
                    <input value={newMessage} onChange={handleTypingEffect} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="TYPE SIGNAL..." className="flex-1 bg-transparent border-none outline-none text-[11px] uppercase tracking-[0.2em] placeholder:text-white/10" />
                  </>
                )}
                <button onClick={mediaBlobUrl ? sendVoiceMessage : handleSend} className={`p-4 rounded-full text-black shadow-lg transition-all active:scale-90 ${mediaBlobUrl ? 'bg-purple-500 shadow-purple-500/40' : 'bg-cyan-500 shadow-cyan-500/40'}`}>
                  {isUploadingVoice ? "..." : <HiOutlinePaperAirplane size={20} className={mediaBlobUrl ? "" : "rotate-45"} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10">
            <HiOutlineChatBubbleBottomCenterText size={80} className="mb-4 text-cyan-400" />
            <h2 className="text-sm font-black uppercase tracking-[1em]">IDLE_NODE</h2>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.2); border-radius: 10px; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Messenger;
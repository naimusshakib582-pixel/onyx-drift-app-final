import React, { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiOutlineChevronLeft, HiOutlinePhone, HiOutlineVideoCamera, 
  HiOutlinePaperAirplane, HiOutlineMagnifyingGlass, 
  HiOutlineFaceSmile, HiOutlineEllipsisVertical, HiCheck,
  HiChatBubbleLeftRight, HiOutlineUserCircle, HiArrowPathRoundedSquare,
  HiOutlinePaperClip, HiOutlineCamera, HiOutlinePhoto
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

const Messenger = () => {
  const { user } = useAuth0();
  const [activeTab, setActiveTab] = useState("chats");
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isUploading, setIsUploading] = useState(false); // আপলোডিং স্টেট

  const socket = useRef();
  const scrollRef = useRef();
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const API_URL = "https://onyx-drift-app-final.onrender.com";

  // --- Socket Logic ---
  useEffect(() => {
    socket.current = io(API_URL, { transports: ["websocket"] });
    socket.current.on("getMessage", (data) => {
      if (currentChat?.members.includes(data.senderId)) {
        setMessages((prev) => [...prev, { ...data, createdAt: Date.now() }]);
      }
    });
    socket.current.on("getOnlineUsers", (users) => setOnlineUsers(users));
    return () => socket.current.disconnect();
  }, [currentChat]);

  useEffect(() => {
    if (user?.sub) socket.current.emit("addNewUser", user.sub);
  }, [user]);

  // --- Fetch Data ---
  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get(`${API_URL}/api/messages/conversation/${user?.sub}`);
      setConversations(res.data || []);
    };
    if (user?.sub) fetch();
  }, [user]);

  useEffect(() => {
    if (currentChat) {
      const fetchMsgs = async () => {
        const res = await axios.get(`${API_URL}/api/messages/message/${currentChat._id}`);
        setMessages(res.data);
      };
      fetchMsgs();
    }
  }, [currentChat]);

  // --- মেসেজ এবং ফাইল হ্যান্ডলিং ---
  const handleSend = async (text, fileUrl = null) => {
    if (!text.trim() && !fileUrl) return;
    const receiverId = currentChat.members.find(m => m !== user.sub);
    
    const messageBody = {
      conversationId: currentChat._id,
      senderId: user.sub,
      text: fileUrl || text, // যদি ইমেজ হয় তবে URL যাবে
      isImage: !!fileUrl // ব্যাকএন্ডে ইমেজ কিনা চেক করার জন্য
    };

    socket.current.emit("sendMessage", { senderId: user.sub, receiverId, text: fileUrl || text });

    try {
      const res = await axios.post(`${API_URL}/api/messages/message`, messageBody);
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) { console.error(err); }
  };

  // ফাইল আপলোড ফাংশন
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // আপনার /api/upload রাউটে ফাইল পাঠানো
      const res = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const uploadedUrl = res.data.url; // নিশ্চিত করুন আপনার ব্যাকএন্ড {url: "..."} রিটার্ন করে
      handleSend("", uploadedUrl); 
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed, please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div className="flex h-screen bg-[#0b141a] text-[#e9edef] overflow-hidden font-sans">
      
      {/* বাম সাইডবার - নেভিগেশন আইকন */}
      <div className="w-[60px] bg-[#202c33] border-r border-[#222d34] flex flex-col items-center py-4 justify-between">
        <div className="flex flex-col gap-6">
          <button onClick={() => setActiveTab("chats")} className={`p-2 rounded-full ${activeTab === "chats" ? "bg-[#374248] text-[#00a884]" : "text-[#aebac1]"}`}>
            <HiChatBubbleLeftRight size={26} />
          </button>
          <button onClick={() => setActiveTab("status")} className={`p-2 rounded-full ${activeTab === "status" ? "bg-[#374248] text-[#00a884]" : "text-[#aebac1]"}`}>
            <HiArrowPathRoundedSquare size={26} />
          </button>
        </div>
        <button onClick={() => setActiveTab("profile")}>
          <img src={user?.picture} className="w-8 h-8 rounded-full border border-[#aebac1]" alt="" />
        </button>
      </div>

      {/* চ্যাট লিস্ট */}
      <div className={`w-full md:w-[400px] border-r border-[#222d34] flex flex-col ${currentChat ? 'hidden md:flex' : 'flex'}`}>
        <header className="bg-[#202c33] p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center text-xl font-bold">
            <h1>Chats</h1>
            <div className="flex gap-4 text-[#aebac1]">
               <HiOutlineCamera size={22} />
               <HiOutlineEllipsisVertical size={22} />
            </div>
          </div>
          <div className="bg-[#111b21] flex items-center px-3 py-1.5 rounded-lg">
            <HiOutlineMagnifyingGlass className="text-[#8696a0]" />
            <input placeholder="Search or start new chat" className="bg-transparent border-none outline-none text-sm ml-4 w-full" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#111b21] custom-scrollbar">
          {conversations.map((c) => (
            <div key={c._id} onClick={() => setCurrentChat(c)} className={`flex items-center p-3 cursor-pointer hover:bg-[#202c33] ${currentChat?._id === c._id ? 'bg-[#2a3942]' : ''}`}>
              <img src={`https://ui-avatars.com/api/?name=${c._id}`} className="w-12 h-12 rounded-full" />
              <div className="flex-1 ml-4 border-b border-[#222d34] pb-3">
                <div className="flex justify-between font-medium">
                  <span>User_{c._id.slice(-4)}</span>
                  <span className="text-xs text-[#8696a0]">10:00 AM</span>
                </div>
                <p className="text-sm text-[#8696a0] truncate">Connected</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* চ্যাট এরিয়া */}
      <div className={`flex-1 flex flex-col bg-[#0b141a] relative ${!currentChat ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {currentChat ? (
          <>
            <header className="bg-[#202c33] px-4 py-2 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button className="md:hidden" onClick={() => setCurrentChat(null)}><HiOutlineChevronLeft size={24} /></button>
                <img src={`https://ui-avatars.com/api/?name=${currentChat._id}`} className="w-10 h-10 rounded-full" />
                <h3 className="font-medium">User_{currentChat._id.slice(-4)}</h3>
              </div>
              <div className="flex gap-6 text-[#aebac1]">
                <HiOutlineVideoCamera size={24} className="cursor-pointer" onClick={() => navigate(`/call/${currentChat._id}?type=video`)} />
                <HiOutlinePhone size={24} className="cursor-pointer" onClick={() => navigate(`/call/${currentChat._id}?type=voice`)} />
              </div>
            </header>

            {/* চ্যাট মেসেজ উইন্ডো */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
              {messages.map((m, i) => {
                const isMe = m.senderId === user?.sub;
                const isImage = m.text.startsWith("http"); // সাধারণ লজিক: URL হলে ইমেজ হিসেবে দেখানো

                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-2 py-1.5 rounded-lg shadow-md ${isMe ? 'bg-[#005c4b]' : 'bg-[#202c33]'} ${isImage ? 'p-1' : ''}`}>
                      {isImage ? (
                        <img src={m.text} className="max-w-full rounded-md max-h-72 object-cover cursor-pointer" alt="Sent" onClick={() => window.open(m.text)} />
                      ) : (
                        <p className="px-1 text-[14.5px]">{m.text}</p>
                      )}
                      <div className="flex justify-end gap-1 mt-1">
                        <span className="text-[10px] text-[#8696a0]">12:00 PM</span>
                        {isMe && <HiCheck size={14} className="text-[#53bdeb]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* ইনপুট এরিয়া */}
            <footer className="bg-[#202c33] p-2 flex items-center gap-3">
              <div className="flex gap-3 text-[#aebac1] ml-2">
                <HiOutlineFaceSmile size={26} className="cursor-pointer" />
                <label className="cursor-pointer">
                   <HiOutlinePaperClip size={26} />
                   <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*" />
                </label>
              </div>
              
              <input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(newMessage)}
                placeholder={isUploading ? "Uploading file..." : "Type a message"}
                disabled={isUploading}
                className="flex-1 bg-[#2a3942] rounded-lg py-2.5 px-4 outline-none text-sm placeholder:text-[#8696a0]"
              />

              <button onClick={() => handleSend(newMessage)} className="mr-2 text-[#aebac1]">
                <HiOutlinePaperAirplane size={24} className={newMessage ? "text-[#00a884]" : ""} />
              </button>
            </footer>
          </>
        ) : (
          <div className="text-center opacity-20">
             <HiChatBubbleLeftRight size={100} className="mx-auto" />
             <h2 className="text-2xl mt-4">WhatsApp Neural Link</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messenger;
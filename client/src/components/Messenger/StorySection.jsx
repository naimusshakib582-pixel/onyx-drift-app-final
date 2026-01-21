import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiPlus, HiXMark, HiOutlineTrash, HiOutlineEye, 
  HiOutlinePaperAirplane, HiOutlineHeart 
} from "react-icons/hi2";

const StorySection = ({ activeUsers, user, storyInputRef }) => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [reply, setReply] = useState("");

  // স্টোরি দেখার সময় টাইমার হ্যান্ডেল করা
  useEffect(() => {
    let timer;
    if (selectedStory) {
      timer = setTimeout(() => {
        setSelectedStory(null);
      }, 5000); // ৫ সেকেন্ড পর স্টোরি বন্ধ হবে
    }
    return () => clearTimeout(timer);
  }, [selectedStory]);

  const reactions = ["❤️", "🙌", "🔥", "😮", "😢", "😂"];

  return (
    <>
      {/* --- Horizontal Story Bar --- */}
      <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar mb-4 py-3 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        {/* Your Story Add Button */}
        <div onClick={() => storyInputRef.current.click()} className="flex flex-col items-center gap-1.5 min-w-[70px] cursor-pointer group">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border-2 border-dashed border-zinc-700 group-hover:border-cyan-500 transition-all overflow-hidden">
               {user?.picture ? (
                 <img src={user.picture} className="w-full h-full object-cover opacity-50" alt=""/>
               ) : (
                 <HiPlus size={24} className="text-zinc-500" />
               )}
            </div>
            <div className="absolute bottom-0 right-0 bg-cyan-500 rounded-full p-1 border-2 border-black">
              <HiPlus size={12} className="text-black" />
            </div>
          </div>
          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter">Your Story</span>
        </div>

        {/* Active Users Stories */}
        {activeUsers.filter(u => u.userId !== user?.sub).map((au, i) => (
          <div 
            key={i} 
            onClick={() => setSelectedStory({ 
                name: au.name || `User_${au.userId.slice(-4)}`, 
                avatar: au.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${au.userId}`,
                image: `https://picsum.photos/400/700?random=${au.userId}`, 
                isOwn: false 
            })} 
            className="flex flex-col items-center gap-1.5 min-w-[70px] cursor-pointer"
          >
            <div className="relative p-[3px] bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full ring-2 ring-black">
              <img 
                src={au.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${au.userId}`} 
                className="w-14 h-14 rounded-full bg-zinc-800 object-cover border-2 border-black" 
                alt=""
              />
              <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full shadow-lg"></div>
            </div>
            <span className="text-[10px] text-zinc-300 font-bold truncate w-16 text-center">{au.name?.split(' ')[0] || "Active"}</span>
          </div>
        ))}
      </div>

      {/* --- Full Screen Story Viewer --- */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 100 }} 
            className="fixed inset-0 z-[600] bg-black flex flex-col items-center justify-center"
          >
            {/* Top Progress Bar */}
            <div className="absolute top-6 left-0 right-0 px-4 flex gap-1 z-[610]">
              <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: '100%' }} 
                  transition={{ duration: 5, ease: "linear" }} 
                  className="h-full bg-cyan-400 shadow-[0_0_10px_#06b6d4]" 
                />
              </div>
            </div>

            {/* Header */}
            <div className="absolute top-10 left-0 right-0 px-4 flex justify-between items-center z-[610]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-cyan-500 overflow-hidden bg-zinc-800 shadow-lg">
                  <img src={selectedStory.avatar} className="w-full h-full object-cover" alt=""/>
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-sm text-white tracking-tight drop-shadow-md">{selectedStory.name}</span>
                  <span className="text-[10px] text-zinc-400 font-bold">Neural Sync Active</span>
                </div>
              </div>
              <button onClick={() => setSelectedStory(null)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-xl text-white transition-all">
                <HiXMark size={24}/>
              </button>
            </div>

            {/* Story Image */}
            <div className="w-full h-full flex items-center justify-center p-2">
               <img src={selectedStory.image} className="max-w-full max-h-[85vh] rounded-3xl object-contain shadow-2xl" alt="story"/>
            </div>

            {/* --- Messenger Like Actions --- */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 bg-gradient-to-t from-black via-black/80 to-transparent z-[610] flex flex-col gap-6">
              
              {/* Quick Reactions */}
              <div className="flex justify-between items-center px-4">
                {reactions.map((emoji, idx) => (
                  <motion.button 
                    whileTap={{ scale: 1.5 }}
                    key={idx} 
                    className="text-2xl hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all"
                    onClick={() => {
                        console.log(`Reacted ${emoji} to ${selectedStory.name}`);
                        // এখানে আপনি API কল করে রিয়েকশন পাঠাতে পারেন
                    }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>

              {/* Reply Input */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-2xl rounded-full px-5 py-3 border border-white/10 shadow-xl">
                <input 
                  type="text" 
                  placeholder="Send a message..." 
                  className="bg-transparent border-none outline-none text-white text-sm flex-1"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <button className="text-cyan-500 active:scale-90 transition-transform">
                  <HiOutlinePaperAirplane size={22} className="rotate-[-20deg]" />
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StorySection;
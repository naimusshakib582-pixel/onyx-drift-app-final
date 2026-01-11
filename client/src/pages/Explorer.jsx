import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineMagnifyingGlass, HiOutlineSparkles, HiOutlineFire, HiOutlineEye } from "react-icons/hi2";
import ChatRoom from "../components/ChatRoom"; // ✅ চ্যাটরুম কম্পোনেন্ট ইম্পোর্ট করা হয়েছে

const Explorer = ({ socket, user }) => { // প্রোফাইল থেকে আসা সকেট এবং ইউজার ডাটা
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const categories = ["All", "Digital Art", "Cyberpunk", "AI Generated", "Minimal", "Nature"];
  const glassStyle = "bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2rem]";

  // ডামি গ্যালারি ডাটা
  const galleryItems = [
    { id: 1, type: "Cyberpunk", url: "https://picsum.photos/600/800?random=1", views: "12K" },
    { id: 2, type: "AI Generated", url: "https://picsum.photos/600/400?random=2", views: "45K" },
    { id: 3, type: "Minimal", url: "https://picsum.photos/600/700?random=3", views: "8K" },
    { id: 4, type: "Digital Art", url: "https://picsum.photos/600/900?random=4", views: "22K" },
    { id: 5, type: "Nature", url: "https://picsum.photos/600/500?random=5", views: "15K" },
    { id: 6, type: "Cyberpunk", url: "https://picsum.photos/600/600?random=6", views: "31K" },
    { id: 7, type: "AI Generated", url: "https://picsum.photos/600/850?random=7", views: "50K" },
    { id: 8, type: "Minimal", url: "https://picsum.photos/600/450?random=8", views: "10K" },
  ];

  return (
    <div className="w-full min-h-screen py-6 animate-fadeIn px-4">
      {/* ১. মেইন লেআউট কন্টেইনার (Flexbox used for Chat-First Layout) */}
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* লজিক্যাল সেকশন: এক্সপ্লোরার ফিড (৭০%) */}
        <div className="flex-1">
          {/* সার্চ এবং ফিল্টার বার */}
          <div className="mb-10 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-[400px]">
                <HiOutlineMagnifyingGlass className="absolute left-5 top-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Discover the future..." 
                  className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-14 pr-6 text-sm outline-none focus:border-cyan-400/50 transition-all placeholder:text-gray-600"
                />
              </div>
              
              <div className="flex gap-3 overflow-x-auto no-scrollbar w-full md:w-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                      ${selectedCategory === cat 
                        ? 'bg-cyan-500 text-black shadow-neon-blue' 
                        : 'bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em]">
              <HiOutlineFire className="text-orange-500" />
              <span>Trending: #ZenithAI #CyberDesign #Futurism2026</span>
            </div>
          </div>

          {/* ম্যাসোনারি গ্রিড */}
          <div className="columns-1 sm:columns-2 xl:columns-3 gap-6 space-y-6">
            <AnimatePresence>
              {galleryItems.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -10 }}
                  className={`relative break-inside-avoid ${glassStyle} group cursor-pointer overflow-hidden`}
                >
                  <img src={item.url} className="w-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0" alt="discover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-6">
                    <div className="flex justify-end">
                       <div className="bg-cyan-500/20 backdrop-blur-md border border-cyan-400/30 p-2 rounded-xl text-cyan-400">
                          <HiOutlineSparkles size={18} />
                       </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] bg-white/10 px-2 py-1 rounded text-cyan-400 border border-white/5">{item.type}</span>
                      <div className="flex items-center justify-between text-white">
                        <p className="text-xs font-bold italic uppercase tracking-tighter">View Genesis</p>
                        <div className="flex items-center gap-1 text-[10px] opacity-70"><HiOutlineEye /> {item.views}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* লোড মোর বাটন */}
          <div className="flex justify-center py-20">
             <motion.button whileTap={{ scale: 0.9 }} className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white/10 transition-all text-gray-400">
                Initialize More Data
             </motion.button>
          </div>
        </div>

        {/* ৩. লাইভ চ্যাট সেকশন (ডেক্সটপে ৩০% জায়গা এবং স্টিকি থাকবে) */}
        <aside className="hidden lg:block w-[350px] xl:w-[400px]">
           <div className="sticky top-[100px] h-[calc(100vh-140px)]">
              <ChatRoom 
                nodeId="global-explorer" // ডিফল্ট গ্লোবাল রুম আইডি
                user={user} 
                socket={socket} 
              />
              <div className="mt-4 p-4 rounded-3xl bg-cyan-500/5 border border-cyan-500/10">
                <p className="text-[10px] font-bold text-cyan-400 uppercase italic tracking-widest mb-1">Neural Advice</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Engage in real-time syncing while you discover new nodes.
                </p>
              </div>
           </div>
        </aside>

      </div>
    </div>
  );
};

export default Explorer;
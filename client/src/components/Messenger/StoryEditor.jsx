import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiXMark, HiOutlinePencil, HiOutlineFaceSmile, 
  HiOutlineMusicalNote, HiOutlineChevronRight,
  HiOutlineAdjustmentsHorizontal
} from "react-icons/hi2";

const StoryEditor = ({ selectedFile, onCancel, onPost, isUploading }) => {
  const [text, setText] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [activeFilter, setActiveFilter] = useState("None");
  const [textColor, setTextColor] = useState("#ffffff");

  // মেমোরি লিক রোধ করার জন্য previewUrl জেনারেট করা
  const previewUrl = useMemo(() => {
    if (!selectedFile) return null;
    try {
      return URL.createObjectURL(selectedFile);
    } catch (e) {
      console.error("URL creation failed", e);
      return null;
    }
  }, [selectedFile]);

  // কম্পোনেন্ট আনমাউন্ট হলে তৈরি করা URL মেমোরি থেকে মুছে ফেলা
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const filters = [
    { name: "None", class: "contrast-100 brightness-100 grayscale-0" },
    { name: "Bright", class: "brightness-125 contrast-110" },
    { name: "Vintage", class: "sepia-[0.5] contrast-90" },
    { name: "Noir", class: "grayscale brightness-90" },
    { name: "Cold", class: "hue-rotate-180 saturate-150" },
  ];

  return (
    <motion.div 
      initial={{ y: "100%" }} 
      animate={{ y: 0 }} 
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[1000] bg-black flex flex-col overflow-hidden touch-none"
    >
      {/* --- Header: Mobile Safe Area Padding --- */}
      <div className="absolute top-12 left-0 right-0 px-6 flex justify-between items-center z-[720]">
        <button 
          onClick={onCancel} 
          className="p-3 bg-black/40 rounded-full text-white backdrop-blur-xl border border-white/10 active:scale-90 transition-transform"
        >
          <HiXMark size={24} />
        </button>
        <div className="flex gap-3">
          <button className="p-3 bg-black/40 rounded-full text-white backdrop-blur-xl border border-white/10 active:scale-90">
            <HiOutlineMusicalNote size={22} />
          </button>
          <button 
            onClick={() => setShowTextInput(true)} 
            className="p-3 bg-black/40 rounded-full text-white backdrop-blur-xl border border-white/10 active:scale-90"
          >
            <HiOutlinePencil size={22} />
          </button>
        </div>
      </div>

      {/* --- Main Preview Area --- */}
      <div className="flex-1 relative flex items-center justify-center bg-zinc-950 overflow-hidden">
        <div className={`w-full h-full transition-all duration-700 ease-in-out ${filters.find(f => f.name === activeFilter)?.class}`}>
          {selectedFile?.type.includes("video") ? (
            <video src={previewUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
          ) : (
            <img src={previewUrl} className="w-full h-full object-cover" alt="preview" />
          )}
        </div>
        
        {/* Floating Text with Drag Constraints (Mobile Optimized) */}
        <AnimatePresence>
          {text && (
            <motion.div 
              drag 
              dragElastic={0.1}
              dragConstraints={{ left: -150, right: 150, top: -250, bottom: 250 }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ color: textColor }}
              className="absolute z-[710] p-4 bg-black/20 backdrop-blur-[2px] rounded-xl font-black text-4xl cursor-move text-center drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] leading-tight select-none uppercase tracking-tighter"
            >
              {text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- Filter Selection Section --- */}
      <div className="px-4 py-6 flex gap-3 overflow-x-auto no-scrollbar bg-gradient-to-t from-black to-transparent">
        {filters.map((f) => (
          <button
            key={f.name}
            onClick={() => setActiveFilter(f.name)}
            className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
              activeFilter === f.name 
              ? "bg-white text-black scale-105 shadow-lg" 
              : "bg-zinc-900/80 text-zinc-500 border border-white/5"
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* --- Bottom Tool Bar: Bottom Safe Area Padding --- */}
      <div className="p-6 bg-black border-t border-white/5 pb-12">
        <div className="flex justify-around items-center bg-zinc-900/40 py-4 rounded-[2rem] border border-white/5 mb-6">
          <button onClick={() => setShowTextInput(true)} className="flex flex-col items-center gap-1.5 text-zinc-400">
            <HiOutlinePencil size={20} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Text</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-zinc-400">
            <HiOutlineFaceSmile size={20} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Sticker</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-cyan-500">
            <HiOutlineAdjustmentsHorizontal size={20} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Filters</span>
          </button>
        </div>

        <button 
          disabled={isUploading}
          onClick={() => onPost(selectedFile, text, activeFilter)} 
          className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${
            isUploading 
            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
            : "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 active:scale-95"
          }`}
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
              Uploading...
            </>
          ) : (
            <>
              Share Story <HiOutlineChevronRight size={18} />
            </>
          )}
        </button>
      </div>

      {/* --- Text Input Overlay (Mobile Optimized Full Screen) --- */}
      <AnimatePresence>
        {showTextInput && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 touch-auto"
          >
            {/* Color Picker */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {["#ffffff", "#06b6d4", "#ff3b30", "#ffcc00", "#4cd964", "#5856d6", "#eb4d4b"].map(color => (
                <button 
                  key={color} 
                  onClick={() => setTextColor(color)}
                  className={`w-9 h-9 rounded-full border-2 transition-transform ${textColor === color ? 'border-white scale-125 shadow-lg' : 'border-white/10'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <textarea 
              autoFocus
              className="bg-transparent border-none outline-none text-white text-5xl font-black text-center w-full resize-none placeholder-zinc-800 uppercase tracking-tighter"
              style={{ color: textColor }}
              placeholder="Aa"
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            
            <button 
              onClick={() => setShowTextInput(false)} 
              className="absolute top-12 right-8 px-8 py-3 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest active:scale-90 shadow-xl"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StoryEditor;
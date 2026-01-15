import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scissors, Wand2, Type, Music4, Sparkles, Repeat, BarChart3, 
  Play, Pause, Plus, X, Sparkle, AudioLines, Palette, Users, 
  LineChart, FastForward, Info, LayoutTemplate, MoreHorizontal,
  RotateCcw, Upload, Volume2
} from 'lucide-react';

const ReelsEditor = () => {
  // --- States ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState('clip');
  const [showSubMenu, setShowSubMenu] = useState(null); 
  const [videoSrc, setVideoSrc] = useState(null);
  const [audioSrc, setAudioSrc] = useState(null);
  const [overlayText, setOverlayText] = useState(""); 
  const [filter, setFilter] = useState('none');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const totalDuration = 30.00;

  // --- ভিডিও আপলোড হ্যান্ডলার ---
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setIsPlaying(false);
      setCurrentTime(0);
      
      // ভিডিও এলিমেন্ট রিলোড করা
      if (videoRef.current) {
        videoRef.current.load();
      }
    }
  };

  // --- অডিও আপলোড হ্যান্ডলার ---
  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioSrc(URL.createObjectURL(file));
    }
  };

  // --- ভিডিও এবং অডিও সিঙ্ক প্লেব্যাক ---
  useEffect(() => {
    let interval;
    if (isPlaying && videoSrc) {
      // প্রোমিজ হ্যান্ডলিং যাতে ব্রাউজার এরর না দেয়
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          if (audioRef.current) audioRef.current.play();
        }).catch(error => console.error("Playback failed:", error));
      }

      interval = setInterval(() => {
        if (videoRef.current) {
          setCurrentTime(videoRef.current.currentTime);
          if (videoRef.current.ended) {
            setIsPlaying(false);
            setCurrentTime(0);
          }
        }
      }, 50);
    } else {
      if (videoRef.current) videoRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
    }
    return () => clearInterval(interval);
  }, [isPlaying, videoSrc]);

  const editTools = [
    { id: 'clip', icon: <Scissors size={20} />, label: 'Cut', color: 'bg-blue-600' },
    { id: 'ai', icon: <Wand2 size={20} />, label: 'AI Sync', color: 'bg-purple-600' },
    { id: 'text', icon: <Type size={20} />, label: 'Text', color: 'bg-yellow-500' },
    { id: 'sound', icon: <Music4 size={20} />, label: 'Beats', color: 'bg-pink-500' },
    { id: 'color', icon: <Palette size={20} />, label: 'Grade', color: 'bg-orange-500' },
    { id: 'analytics', icon: <LineChart size={20} />, label: 'Viral', color: 'bg-emerald-500' },
  ];

  return (
    <div className="fixed inset-0 bg-[#050505] flex flex-col overflow-hidden text-white font-sans">
      
      {/* Hidden Inputs */}
      <input type="file" ref={fileInputRef} onChange={handleVideoUpload} accept="video/*" className="hidden" />
      <input type="file" ref={audioInputRef} onChange={handleAudioUpload} accept="audio/*" className="hidden" />

      {/* TOP HEADER */}
      <div className="p-4 flex justify-between items-center z-[100] bg-black/50">
        <div className="flex gap-2">
          <div className="bg-white/5 p-2 rounded-2xl border border-white/10 flex items-center gap-2">
            <BarChart3 size={14} className="text-cyan-400" />
            <span className="text-[9px] font-black uppercase">98% Retention</span>
          </div>
          <button onClick={() => fileInputRef.current.click()} className="bg-white/10 p-2 rounded-2xl border border-white/10 flex items-center gap-2">
            <Upload size={14} />
            <span className="text-[9px] font-black uppercase">Upload</span>
          </button>
        </div>
        <button className="bg-blue-600 px-6 py-2 rounded-full font-black text-[10px]">EXPORT 4K</button>
      </div>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-row relative">
        <div className="flex-1 relative flex items-center justify-center p-4">
          <div className="w-full max-w-[300px] aspect-[9/16] bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-white/5">
             
             {/* Preview Screen */}
             <div className="absolute inset-0 bg-black flex items-center justify-center">
                {videoSrc ? (
                  <video 
                    ref={videoRef} 
                    src={videoSrc} 
                    className="w-full h-full object-cover" 
                    style={{ filter: filter }} 
                    playsInline 
                  />
                ) : (
                  <div className="text-zinc-600 text-[10px] font-black uppercase text-center">ভিডিও লোড হচ্ছে না?<br/>Media সিলেক্ট করুন</div>
                )}

                {/* ড্র্যাগেবল টেক্সট */}
                {overlayText && (
                  <motion.div 
                    drag 
                    dragConstraints={{ left: -100, right: 100, top: -200, bottom: 200 }}
                    className="absolute z-20 bg-yellow-400 text-black px-4 py-1 font-black italic text-xl uppercase skew-x-[-12deg] cursor-move shadow-2xl"
                  >
                    {overlayText}
                  </motion.div>
                )}
             </div>

             {/* প্লে/পজ বাটন */}
             <div className="absolute inset-0 z-30 flex items-center justify-center">
               <button 
                 onClick={() => videoSrc && setIsPlaying(!isPlaying)} 
                 className="p-6 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-xl"
               >
                 {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" />}
               </button>
             </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="w-20 bg-black/40 border-l border-white/5 flex flex-col items-center py-8 gap-8 z-[150]">
          {editTools.map((tool) => (
            <button 
              key={tool.id} 
              onClick={() => { setActiveTab(tool.id); setShowSubMenu(tool.label); }} 
              className={`flex flex-col items-center gap-2 transition-all ${activeTab === tool.id ? 'opacity-100 scale-110' : 'opacity-40'}`}
            >
              <div className={`p-4 rounded-2xl ${activeTab === tool.id ? tool.color : 'bg-zinc-900'}`}>
                {tool.icon}
              </div>
              <span className="text-[8px] font-black uppercase">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TIMELINE */}
      <div className="bg-[#080808] border-t border-white/10 p-6 pb-12">
        <div className="flex justify-between items-center mb-5">
           <span className="text-2xl font-mono">00:{currentTime.toFixed(2).padStart(5, '0')}</span>
           <button onClick={() => fileInputRef.current.click()} className="p-2 bg-cyan-500/20 rounded-full">
             <Plus size={24} className="text-cyan-400" />
           </button>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-500" style={{ width: `${(currentTime / totalDuration) * 100}%` }} />
        </div>
      </div>

      {/* STUDIO পপ-আপ মেনু (স্ক্রিনশটের মতো) */}
      <AnimatePresence>
        {showSubMenu && (
          <div className="fixed inset-0 z-[250] flex items-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowSubMenu(null)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full bg-[#0f0f0f] rounded-t-[3.5rem] p-10 border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
              
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                  <Sparkle className="text-cyan-400" /> {showSubMenu} Studio
                </h3>
                <button onClick={() => setShowSubMenu(null)} className="p-3 bg-white/5 rounded-full"><X size={24}/></button>
              </div>

              {/* মেনু কন্টেন্ট ফিল্টার/টেক্সট অনুযায়ী পরিবর্তন হবে */}
              <div className="grid grid-cols-2 gap-5 mb-10">
                {showSubMenu === 'Text' ? (
                  <input 
                    type="text" 
                    onChange={(e) => setOverlayText(e.target.value.toUpperCase())}
                    className="col-span-2 bg-white/5 border border-white/10 p-6 rounded-3xl text-xl font-black outline-none focus:border-yellow-400"
                    placeholder="আপনার টেক্সট লিখুন..."
                  />
                ) : showSubMenu === 'Grade' ? (
                  ['None', 'Retro', 'B&W', 'Cinematic'].map(f => (
                    <button key={f} onClick={() => setFilter(f === 'Retro' ? 'sepia(0.8)' : f === 'B&W' ? 'grayscale(1)' : 'none')} className="p-6 bg-white/5 border border-white/5 rounded-[2rem] text-[10px] font-black uppercase hover:bg-white/10">{f}</button>
                  ))
                ) : (
                  <>
                    <button className="p-6 bg-white/5 border border-white/5 rounded-[2rem] text-[10px] font-black uppercase hover:bg-white/10">Precision Cut</button>
                    <button className="p-6 bg-white/5 border border-white/5 rounded-[2rem] text-[10px] font-black uppercase hover:bg-white/10">AI Enhance</button>
                    <button className="p-6 bg-white/5 border border-white/5 rounded-[2rem] text-[10px] font-black uppercase hover:bg-white/10">Split Clip</button>
                    <button className="p-6 bg-white/5 border border-white/5 rounded-[2rem] text-[10px] font-black uppercase hover:bg-white/10">Upscale 4K</button>
                  </>
                )}
              </div>

              <button onClick={() => setShowSubMenu(null)} className="w-full bg-white text-black py-6 rounded-3xl font-black uppercase tracking-[0.3em]">Save Changes</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* অডিও ইলিমেন্ট */}
      {audioSrc && <audio ref={audioRef} src={audioSrc} />}
    </div>
  );
};

export default ReelsEditor;
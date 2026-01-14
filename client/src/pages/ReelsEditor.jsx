import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scissors, Wand2, Type, Music4, Sparkles, 
  Repeat, Layers, BarChart3, DownloadCloud, Play, Pause, 
  RotateCcw, Plus, X, Cpu, CheckCircle2, Languages, Target, 
  Music, LayoutTemplate, Mic2, Maximize2, ShoppingBag, Flame,
  Volume2, Waveform, Mic, Sparkle, AlignCenter, Palette,
  Users, UserCircle2, LineChart, FastForward, Zap, ShieldCheck
} from 'lucide-react';

const ReelsEditor = () => {
  const [activeTab, setActiveTab] = useState('clip');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showSubMenu, setShowSubMenu] = useState(null); 
  const [remixLayout, setRemixLayout] = useState('single');

  // ১২+৩ (Secret) পয়েন্টের সমন্বয়
  const editTools = [
    { id: 'clip', icon: <Scissors size={20} />, label: 'Clip', color: 'bg-blue-500' },
    { id: 'ai', icon: <Wand2 size={20} />, label: 'AI Magic', color: 'bg-purple-600' },
    { id: 'text', icon: <Type size={20} />, label: 'Text', color: 'bg-yellow-500' },
    { id: 'sound', icon: <Music4 size={20} />, label: 'Sound', color: 'bg-pink-500' },
    { id: 'effects', icon: <Sparkles size={20} />, label: 'Effects', color: 'bg-cyan-500' },
    { id: 'color', icon: <Palette size={20} />, label: 'Color', color: 'bg-orange-500' },
    { id: 'remix', icon: <Repeat size={20} />, label: 'Remix', color: 'bg-green-500' },
    { id: 'collab', icon: <Users size={20} />, label: 'Collab', color: 'bg-indigo-600' },
    { id: 'avatar', icon: <UserCircle2 size={20} />, label: 'Avatar', color: 'bg-rose-500' },
    { id: 'styles', icon: <ShoppingBag size={20} />, label: 'Styles', color: 'bg-zinc-600' },
    { id: 'analytics', icon: <LineChart size={20} />, label: 'Analytics', color: 'bg-emerald-500' },
  ];

  const handleExport = () => {
    setIsExporting(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setExportProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => { setIsExporting(false); setExportProgress(0); }, 800);
      }
    }, 40);
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden text-white font-sans">
      
      {/* --- TOP BAR: Hook Analytics & Export (Point 11 & 12) --- */}
      <div className="p-4 flex justify-between items-center bg-gradient-to-b from-black to-transparent z-50">
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-lg">
            <BarChart3 size={16} className="text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Retention: 98%</span>
          </div>
          <div className="flex items-center gap-2 bg-purple-500/20 backdrop-blur-xl p-2 rounded-2xl border border-purple-500/20">
            <Users size={14} className="text-purple-400" />
            <span className="text-[10px] font-black">Collab Live</span>
          </div>
        </div>
        <button onClick={handleExport} className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2 rounded-full font-black text-xs shadow-xl active:scale-90 transition-transform">
          EXPORT 4K
        </button>
      </div>

      {/* --- VIDEO PREVIEW AREA (Point 1, 4, 9, 13) --- */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        <div className={`w-full max-w-[310px] aspect-[9/16] bg-zinc-900 rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden relative flex ${remixLayout === 'split' ? 'flex-row' : ''}`}>
           
           <div className={`relative transition-all duration-700 w-full flex flex-col items-center justify-center bg-zinc-800`}>
              {/* Point 4: Text Engine Preview */}
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }} 
                transition={{ repeat: Infinity, duration: 1 }}
                className="z-20 px-4 py-2 bg-yellow-400 text-black font-black italic text-2xl rounded shadow-2xl uppercase tracking-tighter"
              >
                Viral Hook ⚡
              </motion.div>
           </div>

           {/* Remix & Layer Overlays */}
           {remixLayout !== 'single' && (
             <motion.div initial={{ x: 100 }} animate={{ x: 0 }} className={remixLayout === 'split' ? 'w-1/2 bg-zinc-700/50 border-l border-white/10 flex items-center justify-center' : 'absolute bottom-24 right-4 w-24 aspect-[9/16] bg-zinc-800 rounded-3xl border-2 border-cyan-500 z-20 flex items-center justify-center'}>
                <p className="text-[8px] font-black opacity-30">LAYER 2</p>
             </motion.div>
           )}

           <button onClick={() => setIsPlaying(!isPlaying)} className="absolute bottom-10 left-1/2 -translate-x-1/2 p-5 bg-white/10 backdrop-blur-2xl rounded-full border border-white/20 z-30 active:scale-75 transition-all">
            {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" className="ml-1" />}
           </button>
        </div>
      </div>

      {/* --- PRO TIMELINE (Point 8) --- */}
      <div className="bg-zinc-950 border-t border-white/10 p-4">
        <div className="flex justify-between items-center mb-3">
           <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">00:12:04 / 00:30:00</span>
           <Plus size={18} className="text-cyan-400 cursor-pointer" />
        </div>
        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
          <div className="h-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center px-2"><Type size={10} className="text-yellow-500 mr-2"/> <div className="h-1.5 w-24 bg-yellow-500/30 rounded"/></div>
          <div className="h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center px-1"><div className="w-full h-full bg-blue-500/40 rounded flex border-r border-black/20" /></div>
          <div className="h-6 bg-pink-500/10 border border-pink-500/20 rounded-lg flex items-center px-2"><Waveform size={10} className="text-pink-500 mr-2"/> <div className="h-1 flex-1 bg-pink-500/20 rounded"/></div>
        </div>
      </div>

      {/* --- MASTER EDIT BAR (Bottom Nav) --- */}
      <div className="bg-black border-t border-white/5 pt-4 pb-8 overflow-x-auto hide-scrollbar">
        <div className="flex px-4 gap-2 min-w-max">
          {editTools.map((tool) => (
            <button key={tool.id} onClick={() => {setActiveTab(tool.id); setShowSubMenu(tool.id);}} className="flex flex-col items-center min-w-[70px]">
              <div className={`p-3.5 rounded-2xl transition-all duration-300 ${activeTab === tool.id ? `${tool.color} shadow-lg shadow-white/5` : 'bg-white/5 hover:bg-white/10'}`}>
                {React.cloneElement(tool.icon, { className: activeTab === tool.id ? 'text-white' : 'text-white/50' })}
              </div>
              <span className={`text-[9px] mt-2 font-black uppercase tracking-widest ${activeTab === tool.id ? 'text-white' : 'text-white/40'}`}>
                {tool.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* --- ALL-IN-ONE ENGINE OVERLAY --- */}
      <AnimatePresence>
        {showSubMenu && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed inset-0 z-[200] flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowSubMenu(null)} />
            <div className="bg-zinc-900 rounded-t-[3.5rem] p-8 border-t border-white/10 relative z-20 shadow-2xl max-h-[70vh] overflow-y-auto hide-scrollbar">
              
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black italic flex items-center gap-3 uppercase tracking-tighter">
                   <Sparkle className="text-cyan-400" /> {showSubMenu} Engine
                </h3>
                <button onClick={() => setShowSubMenu(null)} className="p-3 bg-white/5 rounded-full"><X size={20}/></button>
              </div>

              {/* Dynamic Sub-menu Content for All 15 Points */}
              <div className="grid grid-cols-2 gap-4">
                {showSubMenu === 'effects' && ['Motion Blur', 'Neon Glow', 'Glitch FX', 'Light Leaks'].map(t => <button key={t} className="p-5 bg-white/5 border border-white/5 rounded-3xl text-[10px] font-black uppercase text-cyan-400">{t}</button>)}
                {showSubMenu === 'color' && ['Cinema LUT', 'Film Grade', 'Neon Pop', 'Vlog Soft'].map(t => <button key={t} className="p-5 bg-white/5 border border-white/5 rounded-3xl text-[10px] font-black uppercase text-orange-400">{t}</button>)}
                {showSubMenu === 'avatar' && ['Head Swap', 'AI Dubbing', 'Studio BG', 'Privacy Face'].map(t => <button key={t} className="p-5 bg-white/5 border border-white/5 rounded-3xl text-[10px] font-black uppercase text-rose-400">{t}</button>)}
                {showSubMenu === 'analytics' && ['Heatmap', 'Viral Score', 'A/B Test', 'Trends'].map(t => <button key={t} className="p-5 bg-white/5 border border-white/5 rounded-3xl text-[10px] font-black uppercase text-emerald-400">{t}</button>)}
                {showSubMenu === 'collab' && ['Shared Asset', 'Live Sync', 'Invite', 'Permissions'].map(t => <button key={t} className="p-5 bg-white/5 border border-white/5 rounded-3xl text-[10px] font-black uppercase text-indigo-400">{t}</button>)}
                
                {/* Previous Tools Reuse */}
                {showSubMenu === 'ai' && ['Auto Edit', 'Beat Sync', 'Magic Cut', '1-Tap Pro'].map(t => <button key={t} className="p-5 bg-white/5 border border-white/5 rounded-3xl text-[10px] font-black uppercase text-purple-400">{t}</button>)}
                {showSubMenu === 'text' && ['Auto Subs', 'Anim Styles', 'Keywords', 'Templates'].map(t => <button key={t} className="p-5 bg-white/5 border border-white/5 rounded-3xl text-[10px] font-black uppercase text-yellow-500">{t}</button>)}
                {showSubMenu === 'sound' && ['Studio Mic', 'Noise Off', 'Beat Iso', 'Reverb'].map(t => <button key={t} className="p-5 bg-white/5 border border-white/5 rounded-3xl text-[10px] font-black uppercase text-pink-500">{t}</button>)}
              </div>

              <button onClick={() => setShowSubMenu(null)} className="w-full mt-10 bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.3em] active:scale-95 transition-transform">Apply Configuration</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- EXPORT LOADING OVERLAY --- */}
      <AnimatePresence>
        {isExporting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-[1000] flex flex-col items-center justify-center p-10">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }} className="absolute inset-0 border-t-4 border-cyan-500 rounded-full shadow-[0_0_50px_rgba(6,182,212,0.5)]" />
              <div className="text-center">
                <h1 className="text-6xl font-black italic">{exportProgress}%</h1>
                <p className="text-[10px] font-black text-cyan-400 tracking-[0.5em] uppercase mt-2">Baking Greatness</p>
              </div>
            </div>
            <div className="mt-16 w-full max-w-xs space-y-4">
               {['Neural Syncing', 'Film Grading', 'AI Subtitles', 'Safety Check'].map((step, i) => (
                 <div key={i} className={`flex justify-between items-center transition-opacity duration-500 ${exportProgress > (i+1)*24 ? 'opacity-100' : 'opacity-20'}`}>
                   <span className="text-[10px] font-black uppercase tracking-widest">{step}</span>
                   <CheckCircle2 size={16} className="text-cyan-400" />
                 </div>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ReelsEditor;
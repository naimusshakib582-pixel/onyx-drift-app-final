import React, { useState, useEffect, useRef } from "react";
// Hi2 থেকে সলিড এবং আউটলাইন আইকনগুলো আলাদাভাবে আনা হচ্ছে
import { 
  HiOutlineMicrophone, 
  HiOutlinePhoneMissedCall, 
  HiOutlineVideoCamera, 
  HiOutlineArrowsPointingOut 
} from "react-icons/hi2";
import { 
  HiMicrophone, 
  HiVideoCamera 
} from "react-icons/hi"; // Slash এর বিকল্প হিসেবে সলিড আইকন ব্যবহার করা হচ্ছে যা বিল্ড এরর দিবে না
import { motion, AnimatePresence } from "framer-motion";

const GroupCallScreen = ({ roomId, participants, onHangup }) => {
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [peers, setPeers] = useState([
    { id: 'me', name: 'You', stream: null },
    { id: 'p1', name: 'Drifter_01', stream: null, isOnline: true },
    { id: 'p2', name: 'Neon_Ghost', stream: null, isOnline: true },
    { id: 'p3', name: 'Onyx_Admin', stream: null, isOnline: false },
  ]);

  const myVideoRef = useRef();

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (myVideoRef.current) myVideoRef.current.srcObject = stream;
        })
        .catch(err => console.error("Neural link camera failed:", err));
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-[#050505] z-[3000] flex flex-col p-4 font-sans">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h2 className="text-cyan-500 font-black text-[10px] uppercase tracking-[0.3em] opacity-80">Neural Link: Active</h2>
          <p className="text-white/40 text-[11px] font-mono mt-1">ID: {roomId?.substring(0, 12)}</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-white/5">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]"></div>
          <span className="text-[10px] font-bold text-white/80">04:22</span>
        </div>
      </div>

      {/* --- VIDEO GRID --- */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 mb-24">
        {peers.map((peer, index) => (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={peer.id}
            className="relative bg-zinc-900/40 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl group"
          >
            {peer.id === 'me' ? (
              <video 
                ref={myVideoRef} 
                autoPlay 
                muted 
                playsInline 
                className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-500 ${!videoActive ? 'opacity-0' : 'opacity-100'}`} 
              />
            ) : null}

            {/* Placeholder for Off Video / Offline */}
            {((peer.id === 'me' && !videoActive) || peer.id !== 'me') && (
               <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
                {!peer.isOnline && peer.id !== 'me' ? (
                   <div className="text-center">
                      <div className="w-14 h-14 bg-zinc-800/50 rounded-full mx-auto mb-3 flex items-center justify-center border border-white/5">
                         <HiVideoCamera className="text-zinc-600" size={24} />
                      </div>
                      <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest animate-pulse">Connecting</p>
                   </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${peer.id}`} 
                      className="w-20 h-20 rounded-full border-2 border-white/10 opacity-60" 
                      alt="avatar"
                    />
                    {peer.id === 'me' && !micActive && (
                      <div className="absolute -bottom-1 -right-1 bg-red-500 p-1.5 rounded-full border-2 border-zinc-900 shadow-lg">
                        <HiMicrophone size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10">
              <span className="text-[10px] font-bold text-white/90">{peer.name}</span>
              {index === 0 && <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- CONTROLS --- */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-[#111]/90 backdrop-blur-3xl px-8 py-5 rounded-[3.5rem] border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]">
        {/* Mic Toggle */}
        <button 
          onClick={() => setMicActive(!micActive)}
          className={`p-4 rounded-full transition-all duration-300 ${micActive ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}
        >
          {micActive ? <HiOutlineMicrophone size={24} /> : <HiMicrophone size={24} />}
        </button>

        {/* Hangup */}
        <button 
          onClick={onHangup}
          className="p-5 bg-red-600 text-white rounded-full shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:scale-110 active:scale-90 transition-all border-4 border-black/20"
        >
          <HiOutlinePhoneMissedCall size={32} />
        </button>

        {/* Video Toggle */}
        <button 
          onClick={() => setVideoActive(!videoActive)}
          className={`p-4 rounded-full transition-all duration-300 ${videoActive ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}
        >
          {videoActive ? <HiOutlineVideoCamera size={24} /> : <HiVideoCamera size={24} />}
        </button>
      </div>
    </div>
  );
};

export default GroupCallScreen;
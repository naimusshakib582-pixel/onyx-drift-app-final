import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlus, FaTimes, FaMusic, FaSmile, FaMagic,
  FaPlayCircle, FaCloudUploadAlt, FaPauseCircle, FaVolumeUp,
  FaHeart, FaFire, FaLaughSquint
} from 'react-icons/fa';

const PremiumHomeFeed = () => {
  // ১. LocalStorage থেকে ডাটা রিড করা
  const getInitialStories = () => {
    const savedStories = localStorage.getItem('user_stories');
    const currentTime = Date.now();
    if (savedStories) {
      const parsed = JSON.parse(savedStories);
      return parsed.filter(s => (currentTime - s.timestamp) < 86400000);
    }
    return [
      { id: 1, img: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=500", name: "Alex", timestamp: currentTime, reactions: [], stickers: [], filterClass: "" },
    ];
  };

  const [stories, setStories] = useState(getInitialStories());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingStory, setViewingStory] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // এডিটর স্টেটসমূহ
  const [showMusicBox, setShowMusicBox] = useState(false);
  const [showEmojiBox, setShowEmojiBox] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [addedStickers, setAddedStickers] = useState([]);
  const [activeFilter, setActiveFilter] = useState("none");
  const [isPlaying, setIsPlaying] = useState(false);

  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  const filters = [
    { name: "none", class: "" },
    { name: "Cyber", class: "hue-rotate-90 saturate-150 contrast-125" },
    { name: "Mono", class: "grayscale brightness-110" },
    { name: "Warm", class: "sepia brightness-90 saturate-150" },
  ];

  const emojis = ["🔥", "❤️", "✨", "👑", "⚡", "🦋", "🌈", "🎈", "💎", "💯"];

  const viralSongs = [
    { id: 1, title: "Midnight City", artist: "M83", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: 2, title: "Nightcall", artist: "Kavinsky", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  ];

  useEffect(() => {
    localStorage.setItem('user_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(e => console.log(e));
      else audioRef.current.pause();
    }
  }, [isPlaying, selectedSong]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    const newStory = {
      id: Date.now(),
      img: selectedImage,
      name: "You",
      timestamp: Date.now(),
      reactions: [],
      stickers: addedStickers,
      filterClass: filters.find(f => f.name === activeFilter).class,
      song: selectedSong
    };
    setStories([newStory, ...stories]);
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    setSelectedSong(null);
    setAddedStickers([]);
    setActiveFilter("none");
    setIsPlaying(false);
    setShowMusicBox(false);
    setShowEmojiBox(false);
  };

  return (
    <div className="relative w-full pb-10 px-4 pt-4 bg-[#020617] min-h-screen text-white font-sans">
      
      {/* ১. অডিও এলিমেন্ট */}
      {selectedSong && <audio ref={audioRef} src={selectedSong.url} loop />}

      {/* ২. স্টোরি বার */}
      <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar items-center">
        <div onClick={() => setIsModalOpen(true)} className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-500 flex items-center justify-center bg-cyan-500/10">
            <FaPlus className="text-cyan-400 text-xl" />
          </div>
          <span className="text-[10px] font-bold uppercase text-cyan-400">Add Story</span>
        </div>

        {stories.map((s) => (
          <div key={s.id} onClick={() => setViewingStory(s)} className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer">
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 to-purple-600">
              <div className="w-full h-full rounded-full border-2 border-[#020617] overflow-hidden">
                <img src={s.img} className={`w-full h-full object-cover ${s.filterClass}`} alt={s.name} />
              </div>
            </div>
            <span className="text-[10px] font-medium text-gray-400 uppercase">{s.name}</span>
          </div>
        ))}
      </div>

      {/* ৩. এডিটর মোডাল */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative w-full max-w-sm h-[90vh] bg-[#0b1120] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
              
              <div className="relative h-[80%] bg-black flex items-center justify-center overflow-hidden">
                {selectedImage ? (
                  <>
                    <img src={selectedImage} className={`w-full h-full object-cover ${filters.find(f => f.name === activeFilter).class}`} alt="preview" />
                    
                    {addedStickers.map((sticker, idx) => (
                      <motion.div drag dragConstraints={{top:-200, left:-150, right:150, bottom:200}} key={idx} className="absolute text-5xl cursor-move z-40">
                        {sticker}
                      </motion.div>
                    ))}

                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-5 z-50 bg-black/40 p-3 rounded-full border border-white/10">
                      <button onClick={() => {setShowMusicBox(!showMusicBox); setShowEmojiBox(false)}} className="text-xl text-white"><FaMusic /></button>
                      <button onClick={() => {setShowEmojiBox(!showEmojiBox); setShowMusicBox(false)}} className="text-xl text-white"><FaSmile /></button>
                      <button onClick={() => {
                        const nextIdx = (filters.findIndex(f => f.name === activeFilter) + 1) % filters.length;
                        setActiveFilter(filters[nextIdx].name);
                      }} className="text-xl text-white"><FaMagic /></button>
                    </div>

                    {showEmojiBox && (
                      <div className="absolute bottom-4 inset-x-4 bg-black/80 backdrop-blur-md p-4 rounded-3xl grid grid-cols-5 gap-3 z-50">
                        {emojis.map(e => (
                          <button key={e} onClick={() => {setAddedStickers([...addedStickers, e]); setShowEmojiBox(false)}} className="text-2xl hover:scale-125 transition-transform">{e}</button>
                        ))}
                      </div>
                    )}

                    {showMusicBox && (
                      <div className="absolute bottom-4 inset-x-4 bg-[#0b1120] p-5 rounded-3xl z-50 max-h-[50%] overflow-y-auto no-scrollbar border border-white/10">
                        <div className="flex justify-between items-center mb-3 text-[10px] font-black uppercase tracking-widest text-cyan-400">
                          <span>Select Song</span>
                          <FaTimes onClick={() => setShowMusicBox(false)} className="cursor-pointer" />
                        </div>
                        {viralSongs.map(song => (
                          <div key={song.id} onClick={() => {setSelectedSong(song); setIsPlaying(true); setShowMusicBox(false)}} className="p-3 mb-2 bg-white/5 rounded-xl text-xs hover:bg-cyan-500/20 cursor-pointer flex justify-between items-center">
                            <div>{song.title} <span className="text-gray-500">- {song.artist}</span></div>
                            <FaVolumeUp className="text-cyan-500 opacity-50" />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div onClick={() => fileInputRef.current.click()} className="flex flex-col items-center cursor-pointer group">
                    <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-all">
                      <FaCloudUploadAlt className="text-4xl text-cyan-500" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Media</span>
                  </div>
                )}
              </div>

              <input type="file" ref={fileInputRef} onChange={handleImageChange} hidden accept="image/*" />

              <div className="p-6 h-[20%] flex items-center gap-4 bg-[#0b1120]">
                <button onClick={closeModal} className="flex-1 py-4 text-xs font-bold uppercase text-gray-500">Cancel</button>
                <button 
                  onClick={handleUpload} 
                  disabled={!selectedImage} 
                  className="flex-1 py-4 bg-cyan-500 rounded-2xl text-xs font-bold uppercase text-black shadow-lg shadow-cyan-500/20 disabled:opacity-30"
                >
                  Share
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ৪. স্টোরি ভিউয়ার */}
      <AnimatePresence>
        {viewingStory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black flex items-center justify-center">
            <div className="relative w-full max-w-md h-full flex items-center justify-center">
              
              {/* প্রোগ্রেস বার */}
              <div className="absolute top-4 inset-x-4 h-1 bg-white/20 rounded-full overflow-hidden z-50">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: "100%" }} 
                  transition={{ duration: 5, ease: "linear" }} 
                  onAnimationComplete={() => setViewingStory(null)}
                  className="h-full bg-cyan-400 shadow-[0_0_10px_cyan]" 
                />
              </div>

              {/* স্টোরি কন্টেন্ট */}
              <img src={viewingStory.img} className={`w-full h-full object-contain ${viewingStory.filterClass}`} alt="story" />
              
              <button onClick={() => setViewingStory(null)} className="absolute top-8 right-4 text-white p-2 z-[310] bg-black/20 rounded-full">
                <FaTimes size={20} />
              </button>

              <div className="absolute bottom-10 left-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-cyan-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-gray-800" />
                </div>
                <span className="font-bold text-sm tracking-wide">{viewingStory.name}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PremiumHomeFeed;
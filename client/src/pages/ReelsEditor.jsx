import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, Plus, X, Scissors, Type, Music4, Palette,
  Sparkles, Sticker, Gauge, RotateCcw, Check
} from "lucide-react";

const TikTokEditor = () => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const [videoSrc, setVideoSrc] = useState(null);
  const [audioSrc, setAudioSrc] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [filter, setFilter] = useState("none");
  const [effect, setEffect] = useState("none");
  const [overlayText, setOverlayText] = useState("");
  const [stickers, setStickers] = useState([]);
  const [trim, setTrim] = useState({ start: 0, end: 30 });
  const [menu, setMenu] = useState(null);

  const totalDuration = 30;

  /* ---------------- PLAY ENGINE ---------------- */
  useEffect(() => {
    let timer;
    if (isPlaying && videoRef.current) {
      videoRef.current.playbackRate = speed;
      videoRef.current.play();
      audioRef.current && audioRef.current.play();

      timer = setInterval(() => {
        const t = videoRef.current.currentTime;
        if (t >= trim.end) {
          setIsPlaying(false);
          videoRef.current.pause();
          audioRef.current && audioRef.current.pause();
        }
        setCurrentTime(t);
      }, 50);
    } else {
      videoRef.current?.pause();
      audioRef.current?.pause();
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed, trim]);

  /* ---------------- HANDLERS ---------------- */
  const uploadVideo = e => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoSrc(URL.createObjectURL(file));
    setCurrentTime(0);
  };

  const uploadAudio = e => {
    const file = e.target.files[0];
    if (!file) return;
    setAudioSrc(URL.createObjectURL(file));
  };

  const seek = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const p = (e.clientX - rect.left) / rect.width;
    const t = p * totalDuration;
    videoRef.current.currentTime = t;
    audioRef.current && (audioRef.current.currentTime = t);
    setCurrentTime(t);
  };

  const addSticker = () => {
    setStickers([...stickers, { id: Date.now() }]);
  };

  /* ---------------- EFFECTS ---------------- */
  const effects = {
    none: "",
    cinematic: "contrast(1.3) saturate(1.4)",
    glitch: "hue-rotate(90deg) contrast(1.4)",
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="fixed inset-0 bg-black text-white">

      <input ref={fileInputRef} type="file" accept="video/*" hidden onChange={uploadVideo} />
      <input ref={audioInputRef} type="file" accept="audio/*" hidden onChange={uploadAudio} />

      {/* PREVIEW */}
      <div className="h-[75%] flex items-center justify-center">
        <div className="relative w-[360px] aspect-[9/16] bg-zinc-900 rounded-2xl overflow-hidden">
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              className="w-full h-full object-cover"
              style={{ filter: `${filter} ${effects[effect]}` }}
            />
          ) : (
            <button onClick={() => fileInputRef.current.click()}
              className="w-full h-full flex items-center justify-center text-zinc-400">
              <Plus size={40} />
            </button>
          )}

          {audioSrc && <audio ref={audioRef} src={audioSrc} />}

          {overlayText && (
            <motion.div drag className="absolute top-10 left-10 bg-white text-black px-4 py-1 font-bold">
              {overlayText}
            </motion.div>
          )}

          {stickers.map(s => (
            <motion.img
              key={s.id}
              drag
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Emoji_u1f525.svg"
              className="absolute w-20"
            />
          ))}

          {!isPlaying && videoSrc && (
            <button onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Play size={50} />
            </button>
          )}
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex justify-around py-3 border-t border-white/10">
        <button onClick={() => setMenu("Text")}><Type /></button>
        <button onClick={() => audioInputRef.current.click()}><Music4 /></button>
        <button onClick={() => setMenu("Filters")}><Palette /></button>
        <button onClick={() => setMenu("Effects")}><Sparkles /></button>
        <button onClick={addSticker}><Sticker /></button>
        <button onClick={() => setMenu("Speed")}><Gauge /></button>
        <button onClick={() => setMenu("Trim")}><Scissors /></button>
      </div>

      {/* TIMELINE */}
      <div className="px-4 pb-4">
        <div onClick={seek} className="h-3 bg-zinc-700 rounded">
          <div className="h-full bg-red-500"
            style={{ width: `${(currentTime / totalDuration) * 100}%` }} />
        </div>
        <div className="text-xs mt-1">{currentTime.toFixed(2)}s</div>
      </div>

      {/* MENUS */}
      <AnimatePresence>
        {menu && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            className="absolute bottom-0 left-0 right-0 bg-zinc-900 p-6 rounded-t-3xl">

            <div className="flex justify-between mb-4">
              <h3>{menu}</h3>
              <button onClick={() => setMenu(null)}><Check /></button>
            </div>

            {menu === "Text" && (
              <input className="w-full p-4 bg-zinc-800"
                placeholder="Type..."
                onChange={e => setOverlayText(e.target.value)} />
            )}

            {menu === "Filters" && (
              ["none", "grayscale(1)", "sepia(1)"].map(f => (
                <button key={f} onClick={() => setFilter(f)}>{f}</button>
              ))
            )}

            {menu === "Effects" && (
              Object.keys(effects).map(e => (
                <button key={e} onClick={() => setEffect(e)}>{e}</button>
              ))
            )}

            {menu === "Speed" && (
              [0.5, 1, 1.5, 2].map(s => (
                <button key={s} onClick={() => setSpeed(s)}>{s}x</button>
              ))
            )}

            {menu === "Trim" && (
              <>
                <input type="range" min="0" max="30"
                  onChange={e => setTrim({ ...trim, start: +e.target.value })} />
                <input type="range" min="0" max="30"
                  onChange={e => setTrim({ ...trim, end: +e.target.value })} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TikTokEditor;

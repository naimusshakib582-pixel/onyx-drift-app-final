import React, { useState } from 'react';
import { Image as ImageIcon, Film, PlayCircle, Send, X } from 'lucide-react';

const PostCreator = () => {
  const [postType, setPostType] = useState('photo'); // photo, video, reel
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);

  return (
    <div className="bg-[#151515] rounded-[2.5rem] border border-white/5 p-6 shadow-xl">
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setPostType('photo')}
          className={`flex-1 py-3 rounded-2xl text-[10px] font-black tracking-widest flex items-center justify-center gap-2 transition-all ${postType === 'photo' ? 'bg-cyan-500 text-black' : 'bg-white/5 text-gray-400'}`}
        >
          <ImageIcon size={16}/> PHOTO
        </button>
        <button 
          onClick={() => setPostType('video')}
          className={`flex-1 py-3 rounded-2xl text-[10px] font-black tracking-widest flex items-center justify-center gap-2 transition-all ${postType === 'video' ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400'}`}
        >
          <Film size={16}/> VIDEO
        </button>
        <button 
          onClick={() => setPostType('reel')}
          className={`flex-1 py-3 rounded-2xl text-[10px] font-black tracking-widest flex items-center justify-center gap-2 transition-all ${postType === 'reel' ? 'bg-rose-500 text-white' : 'bg-white/5 text-gray-400'}`}
        >
          <PlayCircle size={16}/> REELS
        </button>
      </div>

      <textarea 
        className="w-full bg-transparent border-none outline-none text-gray-300 placeholder:text-gray-600 text-sm resize-none h-20"
        placeholder={`What's drifting in your mind? #${postType}...`}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {file && (
        <div className="relative mb-4 rounded-2xl overflow-hidden border border-white/10">
          <img src={URL.createObjectURL(file)} className="w-full h-48 object-cover opacity-50" />
          <button onClick={() => setFile(null)} className="absolute top-2 right-2 p-1 bg-black rounded-full"><X size={16}/></button>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <label className="cursor-pointer p-3 bg-white/5 rounded-xl text-cyan-400 hover:bg-white/10 transition-all">
          <ImageIcon size={20} />
          <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} accept={postType === 'photo' ? 'image/*' : 'video/*'} />
        </label>
        
        <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-cyan-400 transition-all">
          Transmit <Send size={14} />
        </button>
      </div>
    </div>
  );
};

export default PostCreator;
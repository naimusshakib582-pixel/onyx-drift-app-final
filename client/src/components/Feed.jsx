import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  FaMicrophone, FaPlus, FaSearch, FaHeart, 
  FaComment, FaShare, FaWaveSquare, FaCheckCircle 
} from 'react-icons/fa';

// API Endpoint লজিক
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:10000" 
  : "https://onyx-drift-app-final.onrender.com";

const PremiumHomeFeed = () => {
  const navigate = useNavigate();
  const { getAccessTokenSilently, user, isAuthenticated } = useAuth0();

  const [isListening, setIsListening] = useState(false);
  const [activeDrift, setActiveDrift] = useState(null);
  const [showPostSuccess, setShowPostSuccess] = useState(false);

  // ভয়েস কমান্ড শুরু
  const startVoiceCommand = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Neural Voice System not supported. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; 
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setActiveDrift("Listening...");
      setShowPostSuccess(false);
    };

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      handleNeuralAction(command);
    };

    recognition.onerror = (err) => {
      console.error(err);
      setIsListening(false);
      setActiveDrift("Neural Drift Interrupted");
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // কমান্ড প্রসেসিং
  const handleNeuralAction = async (cmd) => {
    // ১. ভয়েস টু পোস্ট
    if (cmd.includes("post") || cmd.includes("create")) {
      const content = cmd.replace(/create post|make post|new post|post/g, "").trim();
      
      if (!content) {
        setActiveDrift("What should I post?");
        return;
      }

      if (!isAuthenticated) {
        setActiveDrift("Please Login First");
        return;
      }

      try {
        setActiveDrift("Transmitting...");
        const token = await getAccessTokenSilently();
        
        const postData = {
          userId: user.sub,
          userName: user.nickname || user.name,
          userPicture: user.picture,
          desc: content
        };

        await axios.post(`${API_BASE_URL}/api/posts`, postData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setActiveDrift("Post Live!");
        setShowPostSuccess(true);
        setTimeout(() => setActiveDrift(null), 4000);
      } catch (error) {
        setActiveDrift("Sync Failed");
        console.error(error);
      }
    } 
    // ২. ভয়েস টু সার্চ
    else if (cmd.includes("search") || cmd.includes("find")) {
      const query = cmd.replace(/search for|search|find/g, "").trim();
      if (query) {
        setActiveDrift(`Searching: ${query}`);
        setTimeout(() => navigate(`/search?q=${query}`), 1000);
      }
    }
    // ৩. নেভিগেশন
    else if (cmd.includes("profile")) {
      setActiveDrift("Opening Profile...");
      setTimeout(() => navigate('/profile/me'), 1000);
    }
    else {
      setActiveDrift(`Unknown Command: ${cmd}`);
    }
  };

  const glassStyle = "bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]";

  return (
    <div className="min-h-screen bg-[#050508] text-white p-4 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <div className="max-w-md mx-auto pb-24 pt-4">
        
        {/* স্টোরি ও ফিড সেকশন আপনার আগের মতোই থাকবে */}
        {/* ... (পূর্বের স্টোরি ও পোস্ট ম্যাপ কোড) ... */}

        {/* স্মার্ট বটম নেভিগেশন (The Orb) */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-[100]">
          <div className={`${glassStyle} rounded-[2.5rem] p-2 flex justify-between items-center px-10 relative border-white/20`}>
            
            <button className="p-4 text-gray-500 hover:text-cyan-400 transition-colors" onClick={() => navigate('/search')}>
              <FaSearch size={20} />
            </button>
            
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
               <AnimatePresence>
                {activeDrift && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-black/80 backdrop-blur-xl px-4 py-1.5 rounded-full border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${showPostSuccess ? 'bg-green-400' : 'bg-cyan-400 animate-ping'}`}></span>
                      <p className={`text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap ${showPostSuccess ? 'text-green-400' : 'text-cyan-400'}`}>
                        {activeDrift}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button 
                onClick={startVoiceCommand}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-5 rounded-full border-4 border-[#050508] relative transition-all duration-500 ${
                  isListening 
                  ? 'bg-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.6)]' 
                  : showPostSuccess 
                    ? 'bg-green-500 shadow-[0_0_40px_rgba(34,197,94,0.6)]' 
                    : 'bg-gradient-to-tr from-cyan-500 to-purple-600 shadow-[0_0_30px_rgba(6,182,212,0.4)]'
                }`}
              >
                {isListening ? (
                  <FaWaveSquare className="text-white text-xl animate-pulse" />
                ) : showPostSuccess ? (
                  <FaCheckCircle className="text-white text-xl" />
                ) : (
                  <FaMicrophone className="text-white text-xl" />
                )}
              </motion.button>
            </div>

            <button className="p-4 text-gray-500 hover:text-purple-400 transition-colors">
              <FaPlus size={20} />
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default PremiumHomeFeed;
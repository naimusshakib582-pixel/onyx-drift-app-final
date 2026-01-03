import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaBell, FaCommentDots, FaUserPlus, FaCheckCircle, FaSignOutAlt } from 'react-icons/fa'; // FaSignOutAlt যোগ করা হয়েছে
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react"; // Auth0 ইম্পোর্ট

const Navbar = ({ user, setSearchQuery }) => {
  const navigate = useNavigate();
  const { logout } = useAuth0(); // logout ফাংশন ডিক্লেয়ার করা হলো
  const [showNotifications, setShowNotifications] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [followedUsers, setFollowedUsers] = useState([]);

  const drifters = [
    { id: "1", name: "Creator_Onyx", status: "Neural Architect", img: "https://i.pravatar.cc/150?u=11" },
    { id: "2", name: "Nexus_Drifter", status: "Verified Member", img: "https://i.pravatar.cc/150?u=12" },
    { id: "3", name: "Sarah_Cloud", status: "Pro Artist", img: "https://i.pravatar.cc/150?u=13" },
    { id: "4", name: "Cyber_Punk", status: "Verified Drifter", img: "https://i.pravatar.cc/150?u=14" },
  ];

  const filteredDrifters = drifters.filter(d => 
    d.name.toLowerCase().includes(localSearch.toLowerCase())
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    setSearchQuery(value); 
    setShowResults(value.length > 0);
  };

  const toggleFollow = (e, userId) => {
    e.stopPropagation();
    if (followedUsers.includes(userId)) {
      setFollowedUsers(followedUsers.filter(id => id !== userId));
    } else {
      setFollowedUsers([...followedUsers, userId]);
    }
  };

  // লগআউট ফাংশন: এটি সরাসরি Auth0 লগইন স্ক্রিনে নিয়ে যাবে
  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <nav className="h-[75px] px-6 flex items-center justify-between bg-transparent w-full relative z-[200]">
      
      {/* ১. লোগো সেকশন */}
      <div className="flex items-center gap-3 min-w-fit cursor-pointer" onClick={() => navigate('/feed')}>
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20"
        >
          <span className="text-black font-black text-lg italic tracking-tighter">OX</span>
        </motion.div>
        <h1 className="hidden md:block text-xl font-black text-white italic tracking-tighter">ONYXDRIFT</h1>
      </div>

      {/* ২. ইন্টারেক্টিভ সার্চ বার */}
      <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-2 w-full max-w-md mx-8 focus-within:border-cyan-400/50 transition-all">
        <FaSearch className="text-gray-500 text-sm" />
        <input
          type="text"
          value={localSearch}
          placeholder="Search creators..."
          className="bg-transparent border-none outline-none px-3 text-xs w-full text-white placeholder-gray-600"
          onChange={handleSearchChange}
          onFocus={() => localSearch.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 300)} 
        />

        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 mt-3 w-full bg-[#0f172a]/95 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[300] backdrop-blur-2xl"
            >
              <div className="p-4 border-b border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                <span>Neural Connects</span>
                <span className="text-cyan-400 animate-pulse font-bold">Live Scan</span>
              </div>
              
              <div className="max-h-[380px] overflow-y-auto no-scrollbar">
                {filteredDrifters.length > 0 ? (
                  filteredDrifters.map((d) => (
                    <div 
                      key={d.id}
                      onClick={() => navigate(`/profile/${d.id}`)}
                      className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer transition-all border-b border-white/5 last:border-none group"
                    >
                      <div className="relative">
                        <img src={d.img} className="w-11 h-11 rounded-2xl object-cover border border-white/10 group-hover:border-cyan-500/50 transition-all" alt={d.name} />
                        <div className="absolute -bottom-1 -right-1 text-cyan-400 bg-[#0f172a] rounded-full p-0.5">
                          <FaCheckCircle size={10} />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-[12px] font-black text-white uppercase italic tracking-tighter group-hover:text-cyan-400 transition-colors">{d.name}</p>
                        <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">{d.status}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate('/messenger'); }}
                          className="p-2.5 bg-white/5 hover:bg-cyan-500/20 rounded-xl text-gray-400 hover:text-cyan-400 transition-all border border-white/5"
                          title="Message"
                        >
                          <FaCommentDots size={14} />
                        </button>
                        
                        <button 
                          onClick={(e) => toggleFollow(e, d.id)}
                          className={`text-[9px] font-black uppercase px-4 py-2 rounded-xl transition-all active:scale-90 border ${
                            followedUsers.includes(d.id) 
                            ? "bg-cyan-500 text-black border-cyan-500" 
                            : "bg-transparent text-cyan-400 border-cyan-400/30 hover:bg-cyan-400/10"
                          }`}
                        >
                          {followedUsers.includes(d.id) ? "Following" : "Follow"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-xs text-gray-500 italic uppercase tracking-[0.2em]">No drifters found in this orbit...</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ৩. ডান পাশ: নোটিফিকেশন ও প্রোফাইল */}
      <div className="flex items-center gap-5 min-w-fit">
        <div className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-gray-400 hover:text-white transition-colors relative">
            <FaBell size={18} className={showNotifications ? "text-cyan-400" : ""} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#020617]"></span>
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-[110]" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-64 bg-[#0f172a] border border-white/10 rounded-2xl p-5 shadow-2xl z-[120] backdrop-blur-xl"
                >
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Neural Updates</p>
                  <div className="text-xs text-gray-400 italic mb-4">No new signals detected...</div>
                  
                  {/* লগআউট বাটন এখানে যোগ করা হলো */}
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase transition-all"
                  >
                    <FaSignOutAlt /> Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <motion.div 
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/profile/${user?.sub}`)}
          className="flex items-center gap-3 bg-white/5 p-1 pr-4 rounded-full border border-white/10 cursor-pointer hover:bg-white/10 transition-all group shadow-inner"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-500/30">
            <img src={user?.picture || "https://via.placeholder.com/150"} className="w-full h-full object-cover" alt="Profile" />
          </div>
          <div className="hidden sm:block">
            <p className="text-[10px] font-black text-white uppercase group-hover:text-cyan-400 transition-colors tracking-tighter">
              {user?.nickname || "Drifter"}
            </p>
            <p className="text-[7px] text-cyan-500 font-bold uppercase tracking-widest">Verified</p>
          </div>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navbar;
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  FaUserPlus, FaEnvelope, FaPhoneAlt, FaRocket, 
  FaUserCheck, FaSearch, FaArrowLeft, FaGhost 
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const FollowingPage = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const targetUserId = queryParams.get('userId');

  const API_URL = "https://onyx-drift-app-final.onrender.com";

  /**
   * ১. সিঙ্গেল প্রোফাইল ও তার পোস্ট ফেচ করা (Target Mode)
   */
  const fetchTargetData = useCallback(async (id) => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const encodedId = encodeURIComponent(id);

      // প্রোফাইল রিকোয়েস্ট
      const res = await axios.get(`${API_URL}/api/user/profile/${encodedId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data) {
        setUsers([res.data]); 
      }

      // সেই ইউজারের পোস্ট রিকোয়েস্ট
      try {
          const postsRes = await axios.get(`${API_URL}/api/posts/user/${encodedId}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setPosts(postsRes.data || []);
      } catch (postErr) {
          console.error("Posts sync failed");
          setPosts([]);
      }

    } catch (err) {
      console.error("📡 Neural Link Error:", err.response?.status);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently, API_URL]);

  /**
   * ২. গ্লোবাল সার্চ ও ডিসকভারি লজিক
   */
  const fetchUsers = useCallback(async (query = "", isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const token = await getAccessTokenSilently();
      const currentPage = isInitial ? 1 : page;
      
      const res = await axios.get(`${API_URL}/api/user/search`, {
        params: { query, page: currentPage, limit: 12 },
        headers: { Authorization: `Bearer ${token}` }
      });

      // যদি ইনিশিয়াল কল হয় তবে লিস্ট রিপ্লেস হবে, নাহলে অ্যাপেন্ড হবে (Pagination)
      setUsers(isInitial ? res.data : (prev) => [...prev, ...res.data]);
      setHasMore(res.data.length === 12);
    } catch (err) {
      console.error("Search Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently, page, API_URL]);

  // কন্ট্রোলার ইফেক্ট: টার্গেট ইউজার থাকলে সার্চ অফ থাকবে
  useEffect(() => {
    if (targetUserId) {
      setSearchTerm(""); // সার্চ ক্লিয়ার করি
      fetchTargetData(targetUserId);
    } else {
      fetchUsers("", true);
    }
  }, [targetUserId, fetchTargetData, fetchUsers]);

  // সার্চবার ইফেক্ট (Debounce)
  useEffect(() => {
    if (targetUserId) return; // টার্গেট মোডে সার্চ চলবে না
    
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchUsers(searchTerm, true);
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, targetUserId, fetchUsers]);

  /**
   * ৩. ফলো সিস্টেম
   */
  const handleFollow = async (targetId) => {
    try {
      const token = await getAccessTokenSilently();
      const res = await axios.post(`${API_URL}/api/user/follow/${encodeURIComponent(targetId)}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(res.data.followed ? "Neural Link Established!" : "Neural Link Severed!");
    } catch (err) { 
      alert("Synchronization Error");
    }
  };

  return (
    <div className="p-4 md:p-6 bg-transparent min-h-screen font-sans max-w-7xl mx-auto selection:bg-cyan-500/30">
      
      {/* Header Section */}
      <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button 
            onClick={() => {
                if(targetUserId) navigate('/following'); // যদি টার্গেট মোডে থাকে তবে ব্যাক করলে মেইন লিস্টে আসবে
                else navigate('/feed');
            }} 
            className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors text-[10px] font-black uppercase tracking-widest mb-4 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
            {targetUserId ? "Back to Discovery" : "Back to Drift"}
          </button>
          <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <FaRocket className="text-cyan-500 animate-bounce" /> 
            {targetUserId ? "NEURAL PROFILE" : "NEURAL DISCOVERY"}
          </h1>
          <p className="text-gray-500 text-[9px] md:text-[10px] mt-2 uppercase tracking-[0.4em] font-bold flex items-center gap-2">
            {targetUserId ? `Target Locked: Secure Connection` : `Found ${users.length} Drifters in Sector`}
          </p>
        </div>

        {/* সার্চ বার শুধুমাত্র ডিসকভারি মোডে দেখাবে */}
        {!targetUserId && (
          <div className="relative w-full md:w-96 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative">
                <input 
                type="text" 
                placeholder="Scan Identity, Bio or ID..." 
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white text-xs outline-none focus:border-cyan-500/50 transition-all backdrop-blur-xl shadow-2xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/50" />
                {searchTerm && (
                    <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 hover:text-white uppercase font-black">Clear</button>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Discovery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
        {users.length > 0 ? users.map((u) => (
          <div 
            key={u.auth0Id || u._id} 
            className={`backdrop-blur-2xl border rounded-[2.5rem] p-6 md:p-7 group shadow-2xl relative transition-all duration-500 hover:-translate-y-2 ${u.auth0Id === targetUserId ? 'bg-cyan-500/10 border-cyan-500/40 ring-1 ring-cyan-500/20' : 'bg-[#0f172a]/40 border-white/5 hover:border-white/20'}`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <img 
                  src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=random`} 
                  className="w-20 h-20 md:w-24 md:h-24 rounded-[2.2rem] object-cover border-4 border-white/5 group-hover:border-cyan-500/50 transition-all shadow-2xl" 
                  alt={u.name} 
                />
                <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-black p-1.5 rounded-full border-2 border-[#020617] shadow-lg shadow-cyan-500/50">
                  <FaUserCheck size={10} />
                </div>
              </div>
              <h3 className="text-white font-black text-lg md:text-xl mt-5 italic uppercase truncate w-full tracking-tighter">{u.name}</h3>
              <p className="text-cyan-400/40 text-[9px] font-black tracking-widest mt-1 uppercase">{u.nickname || "PERMANENT DRIFTER"}</p>
              
              <div className="mt-3 flex gap-2">
                <span className="text-[7px] text-gray-500 bg-white/5 px-2 py-1 rounded-md border border-white/5 uppercase font-bold tracking-tighter">ID: {u.auth0Id?.slice(-10)}</span>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-3 gap-3">
                <button onClick={() => handleFollow(u.auth0Id)} className="flex flex-col items-center justify-center p-3 md:p-4 bg-white/5 rounded-3xl border border-white/5 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all group/btn shadow-inner">
                  <FaUserPlus size={16} className="group-hover/btn:scale-110 transition-transform" />
                  <span className="text-[7px] font-black mt-1 uppercase">Link</span>
                </button>
                <button onClick={() => navigate(`/messenger?userId=${encodeURIComponent(u.auth0Id)}`)} className="flex flex-col items-center justify-center p-3 md:p-4 bg-white/5 rounded-3xl border border-white/5 text-purple-500 hover:bg-purple-600 hover:text-white transition-all group/btn shadow-inner">
                  <FaEnvelope size={16} className="group-hover/btn:scale-110 transition-transform" />
                  <span className="text-[7px] font-black mt-1 uppercase">Chat</span>
                </button>
                <button 
                  onClick={() => navigate(`/call/${u.auth0Id}`)} // কল পেজের রাউট অনুযায়ী
                  className="flex flex-col items-center justify-center p-3 md:p-4 bg-white/5 rounded-3xl border border-white/5 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all group/btn shadow-inner"
                >
                  <FaPhoneAlt size={16} className="group-hover/btn:scale-110 transition-transform" />
                  <span className="text-[7px] font-black mt-1 uppercase">Call</span>
                </button>
            </div>
          </div>
        )) : !loading && (
          <div className="col-span-full py-24 text-center bg-white/5 rounded-[3.5rem] border border-dashed border-white/10 backdrop-blur-sm">
             <FaGhost className="mx-auto text-gray-800 mb-4 text-4xl animate-pulse" />
             <p className="text-white/20 uppercase font-black tracking-[0.4em] text-[10px]">No Signal Detected in this Frequency</p>
             <button onClick={() => setSearchTerm("")} className="mt-4 text-cyan-500 text-[10px] font-black uppercase underline decoration-cyan-500/20">Reset Scanner</button>
          </div>
        )}
      </div>

      {/* Target User Posts Section */}
      {targetUserId && !loading && (
        <div className="mt-10 md:mt-20 animate-in fade-in slide-in-from-bottom duration-1000">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-cyan-500/50" />
            <h2 className="text-xl md:text-2xl font-black text-white italic tracking-tighter flex items-center gap-3">
              NEURAL SIGNALS
            </h2>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-cyan-500/50" />
          </div>
          
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {posts.map(post => (
                <div key={post._id} className="bg-white/5 border border-white/10 p-5 md:p-6 rounded-[2.5rem] backdrop-blur-md hover:border-cyan-500/30 transition-all group shadow-2xl flex flex-col h-full">
                  {post.media && (
                    <div className="overflow-hidden rounded-3xl mb-4 border border-white/5 relative aspect-video">
                       {post.mediaType === 'video' ? (
                         <video src={post.media} className="w-full h-full object-cover" controls />
                       ) : (
                         <img src={post.media} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Signal" />
                       )}
                       <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-cyan-400 border border-cyan-500/20">
                            {post.mediaType?.toUpperCase() || 'DATA'}
                       </div>
                    </div>
                  )}
                  <p className="text-gray-300 text-sm leading-relaxed mb-6 font-medium px-2">{post.text || post.content}</p>
                  <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                    <span className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-cyan-500 rounded-full animate-ping" />
                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-white/20 italic">Encrypted Connection</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/5 backdrop-blur-sm">
               <p className="text-gray-600 font-black uppercase tracking-[0.4em] text-[10px]">No Neural Echoes Found</p>
            </div>
          )}
        </div>
      )}

      {/* Neural Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#020617]/90 backdrop-blur-xl z-[100]">
          <div className="text-center relative">
            <div className="w-24 h-24 border-2 border-cyan-500/5 border-t-cyan-500 rounded-full animate-spin mx-auto mb-6 shadow-[0_0_50px_rgba(6,182,212,0.2)]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <FaRocket className="text-cyan-500 animate-pulse text-xl" />
            </div>
            <p className="text-cyan-500 font-black animate-pulse uppercase text-[10px] tracking-[0.6em] ml-2">Scanning Multiverse...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowingPage;
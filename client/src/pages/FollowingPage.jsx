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
  const [posts, setPosts] = useState([]); // নির্দিষ্ট ইউজারের পোস্টের জন্য
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { getAccessTokenSilently, user: auth0User } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const targetUserId = queryParams.get('userId');

  const API_URL = "https://onyx-drift-app-final.onrender.com";

  /**
   * নির্দিষ্ট ইউজারের প্রোফাইল এবং পোস্ট ফেচ করা
   */
  const fetchTargetData = useCallback(async (id) => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const decodedId = decodeURIComponent(id);
      
      // আমাদের নতুন ব্যাকএন্ড এন্ডপয়েন্ট কল করা হচ্ছে
      const res = await axios.get(`${API_URL}/api/user/user/${encodeURIComponent(decodedId)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // রেজাল্টে ইউজার এবং পোস্ট দুটোই থাকবে
      if (res.data.user) setUsers([res.data.user]);
      if (res.data.posts) setPosts(res.data.posts);
      
      setLoading(false);
    } catch (err) {
      console.error("Neural Fetch Error:", err);
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  /**
   * সাধারণ ইউজার লিস্ট ফেচ করা (সার্চের জন্য)
   */
  const fetchUsers = useCallback(async (query = "", isInitial = false) => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const currentPage = isInitial ? 1 : page;
      
      const res = await axios.get(`${API_URL}/api/user/search`, {
        params: { query, page: currentPage, limit: 12 },
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(isInitial ? res.data : [...users, ...res.data]);
      setHasMore(res.data.length === 12);
      setLoading(false);
    } catch (err) {
      console.error("Search Error:", err.message);
      setLoading(false);
    }
  }, [getAccessTokenSilently, page, users]);

  // ১. ইনিশিয়াল লোড লজিক
  useEffect(() => {
    if (targetUserId) {
      setSearchTerm(""); 
      setPosts([]); // পুরানো পোস্ট ক্লিয়ার করা
      fetchTargetData(targetUserId);
    } else {
      fetchUsers("", true);
    }
  }, [targetUserId, fetchTargetData]);

  // ২. সার্চ ডিব্রাউন্স
  useEffect(() => {
    if (targetUserId) return; 
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 0) {
        setPage(1);
        fetchUsers(searchTerm, true);
      }
    }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, targetUserId]);

  const handleFollow = async (targetId) => {
    try {
      const token = await getAccessTokenSilently();
      const res = await axios.post(`${API_URL}/api/user/follow/${encodeURIComponent(targetId)}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // আপডেট স্টেট লজিক আগের মতই থাকবে...
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-6 bg-transparent min-h-screen font-sans max-w-7xl mx-auto selection:bg-cyan-500/30">
      
      {/* Header Section */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button onClick={() => navigate('/feed')} className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors text-[10px] font-black uppercase tracking-widest mb-4 group">
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Drift
          </button>
          <h1 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <FaRocket className="text-cyan-500 animate-bounce" /> NEURAL DISCOVERY
          </h1>
          <p className="text-gray-500 text-[10px] mt-2 uppercase tracking-[0.4em] font-bold flex items-center gap-2">
            {targetUserId ? `Identity Locked: ${targetUserId}` : "Detecting drifters in your sector"}
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Search Identity Name..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white text-xs outline-none focus:border-cyan-500/50 transition-all backdrop-blur-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      {/* Discovery Grid (Profile Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {users.map((user) => (
          <div key={user.auth0Id} className={`backdrop-blur-2xl border rounded-[2.5rem] p-7 group shadow-2xl relative transition-all duration-500 ${user.auth0Id === targetUserId ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-[#0f172a]/40 border-white/5'}`}>
            <div className="flex flex-col items-center text-center">
              <img src={user.avatar || user.picture} className="w-24 h-24 rounded-[2.2rem] object-cover border-4 border-white/5 group-hover:border-cyan-500/50" alt={user.name} />
              <h3 className="text-white font-black text-xl mt-5 italic uppercase">{user.name}</h3>
              <p className="text-cyan-400/40 text-[9px] font-black tracking-widest mt-1">{user.nickname || "DRIFTER"}</p>
            </div>
            
            <div className="mt-8 grid grid-cols-3 gap-3">
                <button onClick={() => handleFollow(user.auth0Id)} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-3xl border border-white/5 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all">
                  <FaUserPlus size={16} /><span className="text-[7px] font-black mt-1">LINK</span>
                </button>
                <button onClick={() => navigate(`/messenger?userId=${user.auth0Id}`)} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-3xl border border-white/5 text-purple-500 hover:bg-purple-600 hover:text-white transition-all">
                  <FaEnvelope size={16} /><span className="text-[7px] font-black mt-1">CHAT</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-3xl border border-white/5 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all">
                  <FaPhoneAlt size={16} /><span className="text-[7px] font-black mt-1">CALL</span>
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* Neural Signals (Posts Section) */}
      {targetUserId && (
        <div className="mt-20">
          <h2 className="text-2xl font-black text-white italic tracking-tighter mb-8 flex items-center gap-3">
            <div className="w-8 h-[2px] bg-cyan-500" /> NEURAL SIGNALS (POSTS)
          </h2>
          
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map(post => (
                <div key={post._id} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-md">
                  {post.mediaUrl && (
                    <img src={post.mediaUrl} className="w-full h-48 object-cover rounded-2xl mb-4 border border-white/5" alt="Post content" />
                  )}
                  <p className="text-gray-300 text-sm leading-relaxed">{post.content || post.text}</p>
                  <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span className="text-cyan-500">{post.mediaType || 'SIGNAL'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem]">
               <FaGhost className="mx-auto text-gray-700 mb-4 text-3xl" />
               <p className="text-gray-600 font-black uppercase tracking-[0.4em] text-xs">No signals found for this drifter</p>
            </div>
          )}
        </div>
      )}

      {loading && <div className="text-center py-20 text-cyan-500 font-black animate-pulse uppercase text-[10px]">Synchronizing...</div>}
    </div>
  );
};

export default FollowingPage;
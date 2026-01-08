import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { FaUserMinus, FaUserCircle, FaRocket } from 'react-icons/fa';

const FollowingPage = () => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();

  const API_URL = "https://onyx-drift-app-final.onrender.com";

  const fetchFollowing = async () => {
    try {
      const token = await getAccessTokenSilently();
      const res = await axios.get(`${API_URL}/api/user/following-list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFollowing(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching following list", err);
      setLoading(false);
    }
  };

  const handleUnfollow = async (targetId) => {
    try {
      const token = await getAccessTokenSilently();
      await axios.post(`${API_URL}/api/user/follow/${targetId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // লিস্ট থেকে রিমুভ করে দেওয়া
      setFollowing(following.filter(user => user.auth0Id !== targetId));
    } catch (err) {
      alert("Unfollow failed");
    }
  };

  useEffect(() => {
    fetchFollowing();
  }, []);

  if (loading) return <div className="p-10 text-cyan-400 animate-pulse">Scanning Neural Network...</div>;

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <FaRocket className="text-cyan-500" />
          MY NEURAL ORBIT
        </h1>
        <p className="text-gray-500 text-xs mt-2 uppercase tracking-[0.3em]">Users you are currently following</p>
      </div>

      {following.length === 0 ? (
        <div className="text-gray-600 italic mt-20 text-center">Your orbit is empty. Explore and connect with others.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {following.map((user) => (
            <div key={user.auth0Id} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:border-cyan-500/50 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <FaUserCircle size={80} />
              </div>
              
              <div className="flex items-center gap-4 relative z-10">
                <img 
                  src={user.avatar || 'https://via.placeholder.com/150'} 
                  alt={user.name} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/20 group-hover:border-cyan-500 transition-colors"
                />
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight uppercase italic">{user.name}</h3>
                  <p className="text-cyan-400/70 text-[10px] tracking-widest uppercase font-black">Linked User</p>
                </div>
              </div>

              <p className="text-gray-400 text-xs mt-4 line-clamp-2 italic font-medium leading-relaxed">
                {user.bio || "This user's neural frequency is stable."}
              </p>

              <button 
                onClick={() => handleUnfollow(user.auth0Id)}
                className="mt-6 w-full py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-rose-500/20"
              >
                <FaUserMinus /> Disconnect Signal
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowingPage;
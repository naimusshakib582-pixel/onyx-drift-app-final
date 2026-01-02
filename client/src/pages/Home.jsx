import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { BRAND_NAME } from "../utils/constants";

// Components
import StorySection from "../components/StorySection";
import PostBox from "../components/PostBox";
import PostCard from "../components/PostCard";
import { FaSpinner } from "react-icons/fa";

const Home = ({ user, searchQuery = "" }) => { 
  const { getAccessTokenSilently } = useAuth0();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

  const fetchPosts = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(`${API_URL}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const term = searchQuery.toLowerCase();
    return (
      post.userName?.toLowerCase().includes(term) || 
      (post.desc || post.content)?.toLowerCase().includes(term)
    );
  });

  const glassStyle = "bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl rounded-[2.5rem]";

  return (
    <div className="w-full min-h-screen">
      <main className="w-full max-w-[680px] mx-auto py-4 flex flex-col gap-6 px-4 sm:px-0">
        
        {/* Global Memories (Stories) - সরাসরি উপরে */}
        <div className={`${glassStyle} p-6 hover:bg-white/[0.07] transition-all`}>
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[.5em] mb-5 px-2">Global Memories</p>
            <StorySection user={user} />
        </div>

        {/* Post Creation Box */}
        <div className="w-full">
            <PostBox user={user} onPostCreated={fetchPosts} />
        </div>

        {/* OnyxDrift Stream Divider */}
        <div className="flex items-center gap-4 px-4 py-2">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{BRAND_NAME} Stream</span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>

        {/* Posts Feed Area */}
        <div className="flex flex-col gap-6 pb-32">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <FaSpinner className="text-cyan-neon animate-spin text-3xl" />
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                Syncing with {BRAND_NAME} Core...
              </p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post) => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  onAction={fetchPosts} 
                />
              ))}
            </AnimatePresence>
          ) : (
            <div className={`${glassStyle} p-12 text-center`}>
              <p className="text-gray-500 text-sm font-light italic">
                {searchQuery ? `No data found for "${searchQuery}"` : "The universe is quiet... Start the conversation."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
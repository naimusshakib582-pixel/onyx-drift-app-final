import { useEffect, useState } from "react";
import axios from "axios";
import { Loader, Flame } from "lucide-react"; 
import PostCard from "../components/PostCard"; 

const ViralFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = "https://onyx-drift-app-final.onrender.com"; // তোমার বেস URL

  useEffect(() => {
    const fetchViralPosts = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/posts/neural-feed`);
        setPosts(res.data);
      } catch (err) {
        console.error("Viral Feed Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchViralPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#010409]">
        <Loader className="animate-spin text-cyan-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010409] text-white font-mono selection:bg-cyan-500/30">
      <div className="max-w-2xl mx-auto px-4 py-10">
        
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Flame className="text-cyan-400" size={24} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">
              Neural_Feed
            </h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
              Top trending drifts from the grid
            </p>
          </div>
        </div>
        
        {/* Posts List */}
        <div className="flex flex-col gap-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))
          ) : (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                No signal found in the neural network...
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #010409; }
        ::-webkit-scrollbar-thumb { background: #0891b2; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ViralFeed;
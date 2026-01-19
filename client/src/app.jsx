import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { io } from "socket.io-client"; 
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from 'react-hot-toast';
import { BRAND_NAME } from "./utils/constants";

// Components & Pages
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Messenger from "./pages/Messenger";
import PremiumHomeFeed from "./pages/PremiumHomeFeed";
import Analytics from "./pages/Analytics";
import Explorer from "./pages/Explorer";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings"; 
import FollowingPage from "./pages/FollowingPage";
import ReelsEditor from "./pages/ReelsEditor"; 
import ReelsFeed from "./pages/ReelsFeed";      
import Call from "./pages/Call";
import ViralFeed from "./pages/ViralFeed"; 
import JoinPage from "./pages/JoinPage"; 
import Landing from "./pages/Landing"; 
import CustomCursor from "./components/CustomCursor";
import MobileNav from "./components/MobileNav";

const ProtectedRoute = ({ component: Component, ...props }) => {
  const AuthenticatedComponent = withAuthenticationRequired(Component, {
    onRedirecting: () => (
      <div className="h-screen flex items-center justify-center bg-[#020617] text-cyan-500 font-mono italic uppercase tracking-widest">
        Initializing Neural Link...
      </div>
    ),
  });
  return <AuthenticatedComponent {...props} />;
};

export default function App() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const location = useLocation();
  const navigate = useNavigate();
  const socket = useRef(null); 
  const [searchQuery, setSearchQuery] = useState("");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // সকেট এবং নোটিফিকেশন লজিক (আপনার আগের কোড অনুযায়ী অপরিবর্তিত)
  useEffect(() => {
    if (isAuthenticated && user?.sub) {
      const socketUrl = "https://onyx-drift-app-final.onrender.com";
      socket.current = io(socketUrl, {
        transports: ["websocket", "polling"],
        withCredentials: true,
      });

      socket.current.on("connect", () => {
        socket.current.emit("addNewUser", user.sub);
      });

      // ... (Call and Notification listeners) ...
      
      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
      };
    }
  }, [isAuthenticated, user?.sub, navigate]);

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#020617]">
      <div className="w-12 h-12 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin" />
    </div>
  );

  const isFullWidthPage = [
    "/messenger", "/messages", "/settings", "/", "/join", "/reels", "/reels-editor"
  ].includes(location.pathname) || 
  location.pathname.startsWith("/messenger") || 
  location.pathname.startsWith("/call/");

  return (
    <div className="min-h-screen bg-[#020617] text-gray-200 font-sans relative overflow-x-hidden">
      <div className="bg-grainy" />
      <Toaster />
      <CustomCursor />

      {/* মেইন কন্টেইনার ফ্লেক্স-কল করা হয়েছে যাতে নেভবার কন্টেন্টের উপরে থাকে */}
      <div className="flex flex-col w-full">
        
        {/* ১. নেভবার (এটি এখন স্ক্রলযোগ্য হবে) */}
        {isAuthenticated && location.pathname !== "/" && location.pathname !== "/join" && (
          <Navbar 
            user={user} 
            socket={socket} 
            setSearchQuery={setSearchQuery} 
            setIsPostModalOpen={setIsPostModalOpen}
            toggleSidebar={() => {}} // এখানে আপনার সাইডবার টগল লজিক দিন
          />
        )}
        
        {/* ২. মেইন কন্টেন্ট এরিয়া */}
        <div className="flex justify-center w-full transition-all duration-500">
          <div className={`flex w-full ${isFullWidthPage ? "max-w-full" : "max-w-[1440px] px-0 lg:px-6"} gap-6`}>
            
            {/* বাম সাইডবার - এটি sticky থাকবে */}
            {isAuthenticated && !isFullWidthPage && (
              <aside className="hidden lg:block w-[280px] sticky top-6 h-[calc(100vh-40px)] mt-6">
                <Sidebar />
              </aside>
            )}
            
            {/* ফিড/মেন কন্টেন্ট */}
            <main className="flex-1 flex justify-center pb-24 lg:pb-10 mt-6">
              <div className={`${isFullWidthPage ? "w-full" : "w-full lg:max-w-[650px] max-w-full"}`}>
                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={isAuthenticated ? <Navigate to="/feed" /> : <Landing />} />
                    <Route path="/join" element={<JoinPage />} /> 
                    <Route path="/feed" element={<ProtectedRoute component={() => <PremiumHomeFeed searchQuery={searchQuery} isPostModalOpen={isPostModalOpen} setIsPostModalOpen={setIsPostModalOpen} />} />} />
                    <Route path="/reels" element={<ProtectedRoute component={ReelsFeed} />} />
                    <Route path="/profile/:userId" element={<ProtectedRoute component={Profile} />} />
                    <Route path="/messages" element={<ProtectedRoute component={() => <Messenger socket={socket} />} />} />
                    <Route path="/settings" element={<ProtectedRoute component={Settings} />} />
                    {/* অন্য সব রুট এখানে দিন... */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </AnimatePresence>
              </div>
            </main>

            {/* ডান সাইডবার (যদি থাকে) */}
            {isAuthenticated && !isFullWidthPage && (
              <aside className="hidden xl:block w-[320px] sticky top-6 h-[calc(100vh-40px)] mt-6">
                {/* Right Content */}
              </aside>
            )}
          </div>
        </div>
      </div>

      {isAuthenticated && <MobileNav userAuth0Id={user?.sub} />}
    </div>
  );
}
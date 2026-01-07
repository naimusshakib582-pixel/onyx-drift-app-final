import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
// ১. SockJS এর বদলে socket.io-client ব্যবহার করুন
import { io } from "socket.io-client"; 
import { motion, AnimatePresence } from "framer-motion";
import { FaMicrophone } from "react-icons/fa";
import { BRAND_NAME, AI_NAME } from "./utils/constants";

// Components & Pages
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Messenger from "./pages/Messenger";
import PremiumHomeFeed from "./pages/PremiumHomeFeed";
import Analytics from "./pages/Analytics";
import Explorer from "./pages/Explorer";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

const ProtectedRoute = ({ component: Component, ...props }) => {
  const AuthenticatedComponent = withAuthenticationRequired(Component);
  return <AuthenticatedComponent {...props} />;
};

export default function App() {
  const { isAuthenticated, isLoading, user, loginWithRedirect } = useAuth0();
  const location = useLocation();
  const socket = useRef(null); // stompClient এর নাম পরিবর্তন করে socket রাখলাম
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated && location.pathname === "/") {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, location.pathname, loginWithRedirect]);

  // ২. সকেট কানেকশন লজিক (Socket.io ভার্সন)
  useEffect(() => {
    if (isAuthenticated && user?.sub) {
      const socketUrl = (import.meta.env.VITE_API_BASE_URL || "https://onyx-drift-api-server.onrender.com").replace(/\/$/, "");
      
      // Socket.io কানেকশন ইনিশিয়ালাইজেশন
      socket.current = io(socketUrl, {
        transports: ["websocket", "polling"],
        withCredentials: true,
      });

      socket.current.on("connect", () => {
        console.log("📡 Connected to OnyxDrift Neural Server (Socket.io)");
        // ইউজারের আইডি পাঠানো
        socket.current.emit("addNewUser", user.sub);
      });

      // নতুন পোস্ট শোনার লজিক
      socket.current.on("receiveNewPost", (newPost) => {
        console.log("New broadcast received via Neural link", newPost);
      });

      socket.current.on("connect_error", (err) => {
        console.warn("Neural Link: Connection unstable. Retrying...");
      });
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#020617]">
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1, 0.95] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-cyan-400 font-black tracking-[0.5em] text-xs uppercase italic animate-pulse">
          {BRAND_NAME} DRIFTING...
        </p>
      </motion.div>
    </div>
  );

  // ... বাকি UI কোড আগের মতোই থাকবে ...
  const isMessenger = location.pathname === "/messenger";
  const isSettings = location.pathname === "/settings";
  const isExplorer = location.pathname === "/explorer";
  const isLanding = location.pathname === "/";

  return (
    <div className="min-h-screen bg-[#020617] text-gray-200 overflow-x-hidden selection:bg-cyan-500/30 font-sans">
      
      {isAuthenticated && !isLanding && (
        <div className="fixed top-0 w-full z-[100] backdrop-blur-xl border-b border-white/5 bg-[#020617]/80">
          <Navbar user={user} socket={socket} setSearchQuery={setSearchQuery} />
        </div>
      )}
      
      <div className={`flex justify-center w-full ${isAuthenticated && !isLanding ? "pt-[100px]" : "pt-0"}`}>
        <div className="flex w-full max-w-[1440px] px-4 gap-6">
          
          {isAuthenticated && !isMessenger && !isSettings && !isLanding && (
            <aside className="hidden lg:block w-[280px] sticky top-[100px] h-[calc(100vh-120px)]">
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-4 h-full shadow-2xl overflow-y-auto no-scrollbar">
                <Sidebar />
              </div>
            </aside>
          )}
          
          <main className={`flex-1 flex justify-center transition-all duration-500
            ${isMessenger || isExplorer || isSettings || isLanding ? "max-w-full" : "max-w-[720px] mx-auto"}`}>
            <div className="w-full">
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={isAuthenticated ? <Navigate to="/feed" /> : <Landing />} />
                  <Route path="/feed" element={<ProtectedRoute component={() => <PremiumHomeFeed searchQuery={searchQuery} />} />} />
                  <Route path="/profile/:userId" element={<ProtectedRoute component={Profile} />} />
                  <Route path="/messenger" element={<ProtectedRoute component={Messenger} />} />
                  <Route path="/analytics" element={<ProtectedRoute component={Analytics} />} />
                  <Route path="/explorer" element={<ProtectedRoute component={Explorer} />} />
                  <Route path="/settings" element={<ProtectedRoute component={Settings} />} />
                </Routes>
              </AnimatePresence>
            </div>
          </main>

          {/* Right Sidebar and other UI code... */}
          {isAuthenticated && !isMessenger && !isSettings && !isLanding && (
            <aside className="hidden xl:block w-[320px] sticky top-[100px] h-[calc(100vh-120px)]">
               {/* Friends list code */}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
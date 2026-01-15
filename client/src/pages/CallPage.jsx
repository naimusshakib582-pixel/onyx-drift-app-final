import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuth0 } from "@auth0/auth0-react";
import { HiOutlineXMark } from "react-icons/hi2";

const CallPage = () => {
  const { roomId } = useParams(); 
  const { user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const zpRef = useRef(null); // Zego instance স্টোর করার জন্য

  // ✅ ZegoCloud Credentials
  const appID = 1086315716;
  const serverSecret = "faa9451e78f290d4a11ff8eb53c79bea"; 

  useEffect(() => {
    const initMeeting = async () => {
      if (!roomId || !isAuthenticated || !user) return;

      try {
        // ১. ইউজার আইডি ক্লিন করা (Zego স্পেশাল ক্যারেক্টার সাপোর্ট করে না)
        const cleanUserID = user.sub.replace(/[^a-zA-Z0-9_]/g, "_");
        const userName = user.name || "Drifter User";

        // ২. কিট টোকেন জেনারেট করা
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID, 
          serverSecret, 
          roomId, 
          cleanUserID, 
          userName
        );

        // ৩. কলিং ইন্টারফেস তৈরি করা
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp; // রেফারেন্সে রাখা হলো

        zp.joinRoom({
          container: containerRef.current,
          sharedLinks: [
            {
              name: 'Invite link',
              url: window.location.origin + window.location.pathname,
            },
          ],
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall, // ১-১ ভিডিও কল
          },
          showScreenSharingButton: true,
          showPreJoinView: false, // সরাসরি রুমে ঢুকবে
          showUserList: false,
          maxUsers: 2,
          layout: "Auto", 
          showLayoutButton: false,
          showNonVideoUser: true,
          showAudioVideoSettingsButton: true,
          onLeaveRoom: () => {
            navigate('/messenger'); // কল শেষ হলে মেসেঞ্জারে ব্যাক করবে
          },
        });
      } catch (error) {
        console.error("Zego Initialization Error:", error);
      }
    };

    if (isAuthenticated) {
      initMeeting();
    }

    // Cleanup: যখন ইউজার পেজ থেকে চলে যাবে
    return () => {
      if (zpRef.current) {
        zpRef.current.destroy();
      }
    };
  }, [roomId, user, isAuthenticated, navigate]);

  return (
    <div className="relative w-full h-screen bg-[#020617] flex flex-col overflow-hidden">
      
      {/* 🛰️ Cyber HUD Overlay (কলের ওপর ভাসমান লেয়ার) */}
      <div className="absolute top-0 left-0 w-full p-6 z-[9999] flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="relative">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-ping absolute inset-0" />
            <div className="w-3 h-3 bg-red-500 rounded-full relative" />
          </div>
          <div>
            <h2 className="text-cyan-400 font-black uppercase tracking-[0.4em] text-[10px]">Neural Link Active</h2>
            <p className="text-white/30 text-[8px] font-mono uppercase tracking-widest">Encrypted Room: {roomId?.substring(0, 12)}</p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/messenger')}
          className="w-12 h-12 bg-white/5 backdrop-blur-2xl rounded-2xl flex items-center justify-center border border-white/10 text-white hover:bg-red-500 hover:text-white transition-all pointer-events-auto shadow-2xl group"
        >
          <HiOutlineXMark size={24} className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      {/* 🎥 Zego Video Container */}
      <div 
        ref={containerRef} 
        className="zego-container w-full h-full"
        style={{ width: '100vw', height: '100vh' }}
      ></div>

      {/* 🎨 CSS Overrides */}
      <style>{`
        .zego-container {
          background-color: #020617 !important;
        }
        /* Zego কন্ট্রোল প্যানেল স্টাইলিং */
        .ZEGO_V_W_CONTROL_BAR {
          background: rgba(2, 6, 23, 0.8) !important;
          backdrop-filter: blur(20px) !important;
          border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
          padding-bottom: 20px !important;
        }
        .ZEGO_V_W_VIDEO_PLAYER {
          object-fit: cover !important;
          border-radius: 16px !important;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        /* লোডিং টেক্সট বা অন্যান্য এলিমেন্ট হাইড করা (প্রয়োজনে) */
        .zp_v_w_loading {
           color: #22d3ee !important;
        }
      `}</style>
    </div>
  );
};

export default CallPage;
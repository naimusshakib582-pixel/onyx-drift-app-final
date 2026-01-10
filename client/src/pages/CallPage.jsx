import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuth0 } from "@auth0/auth0-react";
import { HiOutlineXMark } from "react-icons/hi2";

const CallPage = () => {
  // ১. useParams-এ 'id'-এর বদলে 'roomId' দিন (App.js-এর সাথে মিল রেখে)
  const { roomId } = useParams(); 
  const { user } = useAuth0();
  const navigate = useNavigate();

  // ২. আপনার সঠিক AppID এবং ServerSecret/AppSign এখানে নিশ্চিত করুন
  const appID = 1086315716;
  const serverSecret = "f0c34875a613274b39afc9b10d6f54a720d8212c57e83423ae902e54458bbd92"; 

  const myMeeting = async (element) => {
    if (!element || !roomId) return;

    // টোকেন জেনারেট করা
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID, 
      serverSecret, // এখন এটি ভেরিয়েবলের সাথে মিলবে
      roomId, 
      user?.sub || Date.now().toString(), 
      user?.name || "Nexus User"
    );

    // কলিং ইন্টারফেস তৈরি করা
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    
    zp.joinRoom({
      container: element,
      sharedLinks: [
        {
          name: 'Personal link',
          url: window.location.origin + window.location.pathname,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall, 
      },
      showScreenSharingButton: true,
      onLeaveRoom: () => {
        navigate(-1); 
      },
    });
  };

  return (
    <div className="relative w-full h-screen bg-[#020617] flex flex-col">
      {/* টপ বার - আপনার ডিজাইন অনুযায়ী */}
      <div className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
        <div>
          <h2 className="text-cyan-400 font-black uppercase tracking-[0.3em] text-xs">Secure Channel</h2>
          <p className="text-white/50 text-[10px] font-bold">ENCRYPTED VIDEO FEED</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white hover:bg-red-500/20 transition-all pointer-events-auto"
        >
          <HiOutlineXMark size={24} />
        </button>
      </div>

      {/* ভিডিও কন্টেইনার */}
      <div 
        ref={myMeeting} 
        className="w-full h-full"
        style={{ width: '100vw', height: '100vh' }}
      ></div>
    </div>
  );
};

export default CallPage;
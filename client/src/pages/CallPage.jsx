import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuth0 } from "@auth0/auth0-react";
import { HiOutlineXMark } from "react-icons/hi2";

const CallPage = () => {
  const { id } = useParams(); // চ্যাট আইডি যা ইউআরএল থেকে আসবে
  const { user } = useAuth0();
  const navigate = useNavigate();

  // আপনার ZegoCloud AppID এবং ServerSecret (এগুলো ZegoCloud dashboard থেকে ফ্রিতে পাবেন)
  // বর্তমানে টেস্ট করার জন্য ডেমো আইডি ব্যবহার করছি
  const appID = 905999037; // আপনার আসল AppID এখানে বসান
const appSign = "e84cd326a88db043bee481ea7374f7694ca16ac282043b16306a17c4c7df42b1";

  const myMeeting = async (element) => {
    // টোকেন জেনারেট করা
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID, 
      serverSecret, 
      id, 
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
          url: window.location.protocol + '//' + window.location.host + window.location.pathname + '?roomID=' + id,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall, // ১-১ ভিডিও কলের জন্য
      },
      showScreenSharingButton: true,
      onLeaveRoom: () => {
        navigate(-1); // কল শেষ হলে আগের পেজে ফিরে যাবে
      },
    });
  };

  return (
    <div className="relative w-full h-screen bg-[#020617] flex flex-col">
      {/* টপ বার */}
      <div className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <div>
          <h2 className="text-cyan-400 font-black uppercase tracking-[0.3em] text-xs">Secure Channel</h2>
          <p className="text-white/50 text-[10px] font-bold">ENCRYPTED VIDEO FEED</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white hover:bg-red-500/20 transition-all"
        >
          <HiOutlineXMark size={24} />
        </button>
      </div>

      {/* ভিডিও কন্টেইনার */}
      <div 
        ref={myMeeting} 
        className="w-full h-full flex-1"
        style={{ width: '100vw', height: '100vh' }}
      ></div>
    </div>
  );
};

export default CallPage;
import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const Call = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  // ১. রেফারেন্স তৈরি করা যাতে বারবার জয়েন না হয়
  const videoContainerRef = useRef(null);
  const isJoined = useRef(false);

  // ২. আপনার সঠিক ZegoCloud Credentials
  // যদি Environment Variable থাকে তবে তা নেবে, না থাকলে ডিফল্ট ভ্যালু নেবে।
  const appID = Number(import.meta.env.VITE_ZEGO_APP_ID) || 1086315716;
  const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET || "faa9451e78f290d4a11ff8eb53c79bea"; 

  useEffect(() => {
    const initCall = async () => {
      // যদি অলরেডি জয়েন করা থাকে বা কন্টেইনার না থাকে তবে রিটার্ন করবে
      if (isJoined.current || !videoContainerRef.current) return;
      isJoined.current = true; 

      try {
        const userID = "drifter_" + Math.floor(Math.random() * 10000);
        const userName = "User_" + userID;

        // ৩. টোকেন জেনারেট করা (এখানে serverSecret-ই দিতে হবে)
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID, 
          serverSecret, 
          roomId, 
          userID, 
          userName
        );

        // ৪. কলিং ইন্টারফেস তৈরি করা
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        
        zp.joinRoom({
          container: videoContainerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },
          showScreenSharingButton: true,
          showPreJoinView: false,
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          onLeaveRoom: () => {
            isJoined.current = false;
            navigate('/messenger'); 
          },
        });
      } catch (error) {
        isJoined.current = false;
        console.error("ZegoCloud Initialization Failed:", error);
      }
    };

    initCall();

    // কম্পোনেন্ট আনমাউন্ট হলে ফ্ল্যাগ রিসেট করা
    return () => {
      isJoined.current = false;
      // কল পেজ থেকে বেরিয়ে গেলে জেনারেট করা ডম এলিমেন্ট পরিষ্কার করা ভালো
      if (videoContainerRef.current) {
        videoContainerRef.current.innerHTML = "";
      }
    };
  }, [roomId, navigate, appID, serverSecret]);

  return (
    <div className="w-screen h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden">
      {/* লোডার এনিমেশন - ভিডিও আসার আগে এটি দেখাবে */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
          <div className="w-20 h-20 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin mb-6 shadow-[0_0_50px_rgba(6,182,212,0.2)]"></div>
          <div className="text-center">
            <h2 className="text-cyan-400 font-black uppercase tracking-[0.3em] text-sm animate-pulse mb-2">
              Initializing Neural Link
            </h2>
            <p className="text-gray-600 text-[10px] uppercase font-bold tracking-widest">
              Securing End-to-End Encryption...
            </p>
          </div>
      </div>
      
      {/* Zego UI Container */}
      <div 
        ref={videoContainerRef} 
        className="w-full h-full z-10 bg-transparent" 
        style={{ width: '100vw', height: '100vh' }}
      />

      {/* Zego ডিফল্ট স্টাইল ওভাররাইড */}
      <style>{`
        .zego-view-container {
          background-color: transparent !important;
        }
      `}</style>
    </div>
  );
};

export default Call;
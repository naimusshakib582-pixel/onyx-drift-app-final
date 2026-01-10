import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const Call = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  // ১. রেফারেন্স তৈরি করা যাতে বারবার জয়েন না হয়
  const videoContainerRef = useRef(null);
  const isJoined = useRef(false);

  const appID = 905999037; 
  const appSign = "e84cd326a88db043bee481ea7374f7694ca16ac282043b16306a17c4c7df42b1"; 

  useEffect(() => {
    const initCall = async () => {
      // যদি অলরেডি জয়েন করা থাকে বা কন্টেইনার না থাকে তবে রিটার্ন করবে
      if (isJoined.current || !videoContainerRef.current) return;
      isJoined.current = true; // ফ্ল্যাগ সেট করা হলো

      try {
        const userID = "drifter_" + Math.floor(Math.random() * 10000);
        const userName = "User_" + userID;

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID, 
          appSign, 
          roomId, 
          userID, 
          userName
        );

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
    };
  }, [roomId, navigate]);

  return (
    <div className="w-screen h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden">
      {/* ক্যাসি ইলাস্ট্রেশন বা ব্যাকগ্রাউন্ড লোডার */}
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
      
      {/* Zego UI Container - ref ব্যবহার করা হয়েছে */}
      <div 
        ref={videoContainerRef} 
        className="w-full h-full z-10 bg-transparent" 
        style={{ width: '100vw', height: '100vh' }}
      />
    </div>
  );
};

export default Call;
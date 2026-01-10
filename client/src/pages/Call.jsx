import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const Call = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // আপনার ZegoCloud ড্যাশবোর্ড থেকে প্রাপ্ত তথ্য
  const appID = 905999037; 
  
  /**
   * আপনার স্ক্রিনশট অনুযায়ী আপনি 'AppSign' মোড ব্যবহার করছেন।
   * স্ক্রিনশটে থাকা 'AppSign' এর পুরো লম্বা কোডটি এখানে ইনভার্টেড কমার ভেতরে বসান।
   */
  const appSign = "e84cd326a88db043bee481ea7374f7694ca16ac282043b16306a17c4c7df42b1"; // আপনার ড্যাশবোর্ড থেকে পুরোটা কপি করুন

  const myMeeting = async (element) => {
    if (!roomId) return;

    try {
      // ইউনিক ইউজার আইডি এবং নাম জেনারেট করা
      const userID = "drifter_" + Math.floor(Math.random() * 10000);
      const userName = "User_" + userID;

      /**
       * generateKitTokenForTest এর প্যারামিটার হিসেবে 'appSign' ব্যবহার করা হচ্ছে।
       * এটি আপনার কনসোলের ৫0১২০ এররটি ফিক্স করবে।
       */
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID, 
        appSign, 
        roomId, 
        userID, 
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      
      zp.joinRoom({
        container: element,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall, // ১-টু-১ কলিং সেটআপ
        },
        showScreenSharingButton: true,
        showPreJoinView: false, // সরাসরি কলে প্রবেশ করবে
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        onLeaveRoom: () => {
          navigate('/messenger'); 
        },
      });
    } catch (error) {
      console.error("ZegoCloud Initialization Failed:", error);
    }
  };

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
      
      {/* Zego UI Container */}
      <div 
        ref={myMeeting} 
        className="w-full h-full z-10 bg-transparent" 
        style={{ width: '100vw', height: '100vh' }}
      />
    </div>
  );
};

export default Call;
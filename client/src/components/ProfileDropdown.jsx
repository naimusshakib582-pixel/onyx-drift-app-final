import React, { useState } from "react";
// Profile কম্পোনেন্টটি এই ফাইলে ব্যবহার না হলে, ইম্পোর্ট করার দরকার নেই।
// import Profile from "./Profile";
import defaultAvatar from "../assets/default-avatar.png";

const ProfileDropdown = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);

  // 💡 যদি user অবজেক্টটি undefined হয়, তাহলে এই কম্পোনেন্টটি কিছুই রেন্ডার করবে না।
  if (!user) {
    return null; 
  }

  return (
    <div className="relative">
      {/* Profile Icon */}
      <img
        // ✅ ফিক্স: user?.avatar ব্যবহার করা হলো
        src={user?.avatar || defaultAvatar} 
        alt="Avatar"
        className="w-10 h-10 rounded-full cursor-pointer"
        onClick={() => setOpen(!open)}
      />

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
          <div className="p-2 border-b">
            {/* ✅ ফিক্স: user?.name ব্যবহার করা হলো */}
            <span className="font-bold">{user?.name}</span>
            {/* ✅ ফিক্স: user?.email ব্যবহার করা হলো */}
            <p className="text-gray-500 text-sm">{user?.email}</p> 
          </div>
          <button
            className="w-full text-left p-2 hover:bg-gray-100"
            onClick={() => {
              alert("Go to Profile page");
              setOpen(false); // ড্রপডাউন বন্ধ করার জন্য
            }}
          >
            Profile
          </button>
          <button
            className="w-full text-left p-2 hover:bg-gray-100 text-red-500"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
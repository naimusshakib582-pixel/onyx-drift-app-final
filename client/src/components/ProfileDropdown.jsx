import React, { useState } from "react";
import Profile from "./Profile";
import defaultAvatar from "../assets/default-avatar.png";

const ProfileDropdown = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Profile Icon */}
      <img
        src={user.avatar || defaultAvatar}
        alt="Avatar"
        className="w-10 h-10 rounded-full cursor-pointer"
        onClick={() => setOpen(!open)}
      />

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
          <div className="p-2 border-b">
            <span className="font-bold">{user.name}</span>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
          <button
            className="w-full text-left p-2 hover:bg-gray-100"
            onClick={() => alert("Go to Profile page")}
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

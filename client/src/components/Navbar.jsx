import React from "react";
import logo from "../assets/images/logo.png";
import { Link, useLocation } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";
import {
  FaHome,
  FaUserFriends,
  FaUsers,
  FaCalendarAlt,
  FaStore,
} from "react-icons/fa";

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { path: "/", icon: <FaHome size={24} /> },
    { path: "/friends", icon: <FaUserFriends size={24} /> },
    { path: "/groups", icon: <FaUsers size={24} /> },
    { path: "/events", icon: <FaCalendarAlt size={24} /> },
    { path: "/marketplace", icon: <FaStore size={24} /> },
  ];

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center space-x-4">
        {/* লোগো লোড হতে সমস্যা হলে যেন পুরো অ্যাপ ক্র্যাশ না করে, তার জন্য এরর হ্যান্ডলিং বা ডিফল্ট লোগো নিশ্চিত করুন */}
        <img src={logo} alt="Logo" className="h-8" />
      </div>

      {/* Icon-only menu */}
      <div className="flex items-center space-x-6">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`p-2 rounded hover:bg-gray-700 transition-colors ${
              location.pathname === item.path ? "bg-gray-700" : ""
            }`}
          >
            {item.icon}
          </Link>
        ))}
      </div>

      {/* Profile Dropdown: user অবজেক্টটি বিদ্যমান থাকলে তবেই রেন্ডার করা হচ্ছে। */}
      {/* যদিও ProfileDropdown-এর ভেতরেই user?.avatar ব্যবহার করা উচিত, 
          তবুও এখানে কন্ডিশনাল রেন্ডারিং যোগ করলে অ্যাপ ক্র্যাশ হওয়ার ঝুঁকি কমে। */}
      {user && <ProfileDropdown user={user} onLogout={onLogout} />}
      {!user && (
        <div className="text-white">
            <Link to="/login" className="px-3 py-1 bg-blue-500 rounded hover:bg-blue-600">Login</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
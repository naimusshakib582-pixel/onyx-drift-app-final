import React, { useState } from "react";
import axios from "axios";

// 💡 ফিক্স ১: আপনার প্রক্সি সার্ভিসের URL ব্যবহার করুন। 
// এটি ফ্রন্টএন্ড এবং ব্যাকএন্ডের মধ্যে সংযোগের জন্য আদর্শ।
const API_URL = "https://onyx-drift-api-server.onrender.com"; 
// যদি প্রক্সি সার্ভার না চান, তবে সার্ভারের আসল URL: "https://onyx-drift-app-final.onrender.com" ব্যবহার করতে পারেন।

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_URL}/api/login`, // প্রক্সি সার্ভারে রিকোয়েস্ট যাচ্ছে
        { email, password },
        { withCredentials: true }
      );
      
      // লগইন সফল হলে মেসেজ সেট করুন
      setMessage(res.data.message || "লগইন সফল হয়েছে!");
      
      // 🚨 লগইন সফল হলে ইউজারকে অন্য পেজে রিডাইরেক্ট করার লজিক এখানে যোগ করুন
      // যেমন: window.location.href = '/feed'; 

    } catch (err) {
      // 💡 ফিক্স ২: ব্যাকএন্ড থেকে আসা মেসেজ (যেমন: Invalid credentials) দেখাচ্ছে কিনা, নিশ্চিত করা
      setMessage(err.response?.data?.msg || err.response?.data?.message || "লগইন ব্যর্থ হয়েছে। সার্ভার ত্রুটি।");
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-64">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Login
        </button>
      </form>
      {message && <p className="mt-4 text-red-500">{message}</p>}
      
      {/* রেজিস্ট্রেশন লিঙ্কটি সঠিকভাবে আছে */}
      <p className="mt-3 text-sm">
        অ্যাকাউন্ট নেই? {" "}
        <a href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
          একটি অ্যাকাউন্ট তৈরি করুন
        </a>
      </p>
    </div>
  );
};

export default Login;
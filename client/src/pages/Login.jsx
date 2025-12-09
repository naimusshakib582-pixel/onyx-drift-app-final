import React, { useState } from "react";
import axios from "axios";

// API URL টি আপনার আসল ব্যাকএন্ডের দিকে সেট করা হয়েছে। 
// যেহেতু আপনি প্রক্সি সার্ভার ব্যবহার করছেন, তাই এই URL এ পরিবর্তন আনছি না।
const API_URL = "https://onyx-drift-app-final.onrender.com"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_URL}/api/login`,
        { email, password },
        { withCredentials: true }
      );
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "লগইন ব্যর্থ হয়েছে। সার্ভার ত্রুটি।");
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
      
      {/* ⚠️ নতুন রেজিস্ট্রেশন লিঙ্ক যুক্ত করা হয়েছে */}
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
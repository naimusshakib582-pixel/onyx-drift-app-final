
    import React, { useState } from "react";
import axios from "axios";

// 💡 ফিক্স: API_URL কে আপনার লাইভ Workers URL দিয়ে প্রতিস্থাপন করুন
const API_URL = "https://onyx-drift-app-final.naimusshakib582.workers.dev"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  
  // 🛑 অতিরিক্ত ভেরিয়েবল মুছে ফেলুন বা অপ্রয়োজনীয় হলে সরিয়ে দিন
  // const RENDER_HTTP_URL = "https://onyx-drift-app-final.naimusshakib582.workers.dev"; // এটি API_URL এর সাথে ডুপ্লিকেট
  // const RENDER_WS_URL = "wss://onyx-drift-app-final.onrender.com"; // এটি এখানে প্রয়োজন নেই

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        // 💡 ফিক্স: এখন এটি সঠিক লাইভ URL এ অনুরোধ পাঠাবে
      const res = await axios.post(`${API_URL}/api/login`, { email, password });
      setMessage(res.data.message);
    } catch (err) {
      // লগইন ব্যর্থ হলে সার্ভার থেকে আসা বার্তা দেখাবে
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
    </div>
  );
};

export default Login;

import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Moon, LogOut, Shield, ChevronRight, Palette, EyeOff, ShieldCheck, Smartphone } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [ghostMode, setGhostMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // ১. ডাটাবেস থেকে ইউজারের বর্তমান সেটিংস লোড করা
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/user/me', {
          headers: { 'x-auth-token': token }
        });
        setGhostMode(res.data.ghostMode);
      } catch (err) {
        console.error("Error fetching settings");
      }
    };
    fetchUserSettings();
  }, []);

  // ২. Ghost Mode টগল ফাংশন (Unique Feature)
  const toggleGhost = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('/api/user/toggle-ghost', {}, {
        headers: { 'x-auth-token': token }
      });
      setGhostMode(res.data.ghostMode);
      alert(res.data.msg);
    } catch (err) {
      alert("Neural Shield Failure!");
    } finally {
      setLoading(false);
    }
  };

  // ৩. পাসওয়ার্ড পরিবর্তন
  const handleChangePassword = async () => {
    const newPassword = prompt("Enter new neural-key (password):");
    if (newPassword && newPassword.length >= 6) {
      try {
        const token = localStorage.getItem('token');
        await axios.put('/api/user/change-password', { password: newPassword }, {
          headers: { 'x-auth-token': token }
        });
        alert("Neural-key updated!");
      } catch (err) {
        alert("Update failed");
      }
    } else if (newPassword) {
      alert("Password must be at least 6 characters");
    }
  };

  // ৪. লগআউট
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="max-w-2xl mx-auto p-4 min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <div className="mb-10 px-2 pt-6">
        <h1 className="text-4xl font-black italic tracking-tighter bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          ONYX SETTINGS
        </h1>
        <p className="text-gray-500 text-xs font-bold tracking-[0.3em] uppercase mt-1">System Configuration</p>
      </div>

      <div className="space-y-6">
        
        {/* UNIQUE: Neural Security Shield Card */}
        <section>
          <p className="text-cyan-500/50 text-[10px] font-black uppercase tracking-[0.2em] mb-3 px-4">Neural Security</p>
          <div className="bg-gradient-to-br from-[#151515] to-[#0a0a0a] rounded-[32px] overflow-hidden border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.05)]">
            
            {/* Ghost Mode Toggle */}
            <div className="p-6 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400">
                  <EyeOff size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-100 italic">Ghost Mode</h3>
                  <p className="text-gray-500 text-[10px]">Invisible to searches & neural-scans</p>
                </div>
              </div>
              <Switch active={ghostMode} toggle={toggleGhost} disabled={loading} />
            </div>

            {/* Password Change */}
            <SettingItem 
              icon={ShieldCheck} 
              title="Neural Key" 
              subtitle="Update system access password" 
              onClick={handleChangePassword}
              color="text-purple-400"
              bg="bg-purple-500/10"
            />
          </div>
        </section>

        {/* Account & Preferences */}
        <section>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 px-4">Core Preferences</p>
          <div className="bg-[#151515] rounded-[32px] overflow-hidden border border-white/5">
            <SettingItem 
              icon={User} 
              title="Profile Identity" 
              subtitle="Modify name, bio, and avatar" 
              onClick={() => window.location.href = '/edit-profile'}
            />
            
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-400"><Moon size={22}/></div>
                <div>
                  <h3 className="font-medium text-gray-100 italic">Dark Protocol</h3>
                  <p className="text-gray-500 text-[10px]">Optimized for night-drifting</p>
                </div>
              </div>
              <Switch active={darkMode} toggle={() => setDarkMode(!darkMode)} />
            </div>

            <SettingItem icon={Bell} title="Pulse Alerts" subtitle="Neural notification frequency" />
          </div>
        </section>

        {/* Termination */}
        <button 
          onClick={handleLogout}
          className="w-full mt-6 flex items-center justify-center gap-3 p-6 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-[28px] transition-all border border-red-500/10 font-black italic uppercase tracking-widest text-sm"
        >
          <LogOut size={20} />
          Terminate Session
        </button>
      </div>
    </div>
  );
};

// Reusable Components
const SettingItem = ({ icon: Icon, title, subtitle, onClick, color = "text-blue-400", bg = "bg-blue-500/10" }) => (
  <div onClick={onClick} className="flex items-center justify-between p-6 hover:bg-white/5 cursor-pointer transition-all border-b border-white/5 last:border-0">
    <div className="flex items-center gap-4">
      <div className={`p-3 ${bg} rounded-2xl ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <h3 className="font-bold text-gray-100 italic">{title}</h3>
        <p className="text-gray-500 text-[10px]">{subtitle}</p>
      </div>
    </div>
    <ChevronRight className="text-gray-700" size={18} />
  </div>
);

const Switch = ({ active, toggle, disabled }) => (
  <div 
    onClick={!disabled ? toggle : null} 
    className={`w-14 h-7 rounded-full p-1 transition-all cursor-pointer flex items-center ${active ? 'bg-cyan-600' : 'bg-gray-800'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <motion.div 
      animate={{ x: active ? 28 : 0 }}
      className="w-5 h-5 bg-white rounded-full shadow-lg" 
    />
  </div>
);

export default Settings;
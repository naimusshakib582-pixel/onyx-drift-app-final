import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const Profile = () => {
  const { user } = useAuth0();
  const userId = user?.sub;

  const [profile, setProfile] = useState({ name: "", email: "", avatar: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!userId) return;
    axios.get(`${API_URL}/api/profile/${userId}`)
      .then(res => setProfile(res.data))
      .catch(err => console.log(err));
  }, [userId]);

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setProfile({ ...profile, avatar: URL.createObjectURL(file) });
    }
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(`${API_URL}/api/profile/${userId}`, {
        name: profile.name,
        avatar: profile.avatar,
      });
      setProfile(res.data);
      alert("Profile saved!");
    } catch (err) {
      console.log(err);
      alert("Failed to save profile");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>

      <div className="flex flex-col items-center mb-4">
        <img
          src={profile.avatar || "https://via.placeholder.com/100"}
          alt="Avatar"
          className="w-24 h-24 rounded-full mb-2 object-cover"
        />
        <input type="file" accept="image/*" onChange={handleAvatarChange} />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={profile.name}
          onChange={e => setProfile({ ...profile, name: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={profile.email || user?.email}
          readOnly
          className="w-full p-2 border rounded bg-gray-100"
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Save Profile
      </button>
    </div>
  );
};

export default Profile;

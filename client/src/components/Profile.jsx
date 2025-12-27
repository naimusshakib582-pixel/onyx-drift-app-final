import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const Profile = () => {
  const { user, isLoading, isAuthenticated } = useAuth0();

  const userId = user?.sub;
  const API_URL = import.meta.env.VITE_API_URL;

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // =========================
  // Load profile from backend
  // =========================
  useEffect(() => {
    if (!userId || !API_URL) return;

    axios
      .get(`${API_URL}/api/profile/${encodeURIComponent(userId)}`)
      .then((res) => {
        setProfile({
          name: res.data.name || "",
          email: res.data.email || user?.email || "",
          avatar: res.data.avatar || "",
        });
      })
      .catch((err) => {
        console.error("❌ Profile fetch error:", err);
      });
  }, [userId, API_URL, user?.email]);

  // =========================
  // Avatar change (preview)
  // =========================
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);
    setProfile((prev) => ({
      ...prev,
      avatar: URL.createObjectURL(file),
    }));
  };

  // =========================
  // Save profile
  // =========================
  const handleSave = async () => {
    if (!userId) return;

    try {
      setSaving(true);

      const res = await axios.put(
        `${API_URL}/api/profile/${encodeURIComponent(userId)}`,
        {
          name: profile.name,
          avatar: profile.avatar, // demo version (URL only)
        }
      );

      setProfile((prev) => ({
        ...prev,
        ...res.data,
      }));

      alert("✅ Profile saved successfully");
    } catch (err) {
      console.error("❌ Profile save error:", err);
      alert("❌ Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Auth0 guards
  // =========================
  if (isLoading) {
    return (
      <div className="text-center mt-10 text-gray-600">
        Loading profile...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center mt-10 text-red-500">
        You are not logged in
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Profile</h2>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={profile.avatar || "https://via.placeholder.com/100"}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover mb-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
        />
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={profile.name}
          onChange={(e) =>
            setProfile((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
          className="w-full p-2 border rounded"
          placeholder="Your name"
        />
      </div>

      {/* Email */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={profile.email}
          readOnly
          className="w-full p-2 border rounded bg-gray-100"
        />
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full p-2 rounded text-white ${
          saving
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
};

export default Profile;

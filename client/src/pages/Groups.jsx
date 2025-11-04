import React from "react";

const Group = () => {
  const groups = ["React Devs", "Music Lovers", "Travel Buddies"];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Groups</h1>
      <ul className="space-y-4">
        {groups.map((group, idx) => (
          <li
            key={idx}
            className="bg-white p-4 rounded shadow hover:bg-gray-50 transition"
          >
            {group}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Group;

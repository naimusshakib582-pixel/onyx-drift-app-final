import React from "react";

const Friends = () => {
  const friendsList = ["Alice", "Bob", "Charlie", "David"];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Friends</h1>
      <ul className="space-y-2">
        {friendsList.map((friend, idx) => (
          <li
            key={idx}
            className="bg-white p-4 rounded shadow hover:bg-gray-50 transition"
          >
            {friend}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Friends;

import React from "react";

const Marketplace = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Marketplace</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow">Product 1</div>
        <div className="bg-white p-4 rounded shadow">Product 2</div>
        <div className="bg-white p-4 rounded shadow">Product 3</div>
      </div>
    </div>
  );
};

export default Marketplace;

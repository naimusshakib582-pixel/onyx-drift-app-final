// client/src/App.tsx (FINAL VERSION - NO IONIC, CLEANED)

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

// আপনার তৈরি করা পৃষ্ঠাগুলির আমদানি (import) করুন
// এই ফাইলগুলি আপনার client/src/pages/ ফোল্ডারে থাকা দরকার।
// import LoginPage from './pages/LoginPage';
// import DashboardPage from './pages/DashboardPage';
// import ProfilePage from './pages/ProfilePage';
// import SetupProfilePage from './pages/SetupProfilePage'; // <--- নতুন প্রোফাইল সেটআপ পেজ আমদানি

// --- ১. নেভিগেশন বার ---
const Navbar = () => {
  const { isAuthenticated, logout, loginWithRedirect } = useAuth0();

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-xl font-bold hover:text-blue-400 transition-colors">OnyxDrift</Link>
      <div className="space-x-4 flex items-center">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
            <Link to="/profile" className="hover:text-gray-300">Profile</Link>
            <button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="bg-red-500 hover:bg-red-600 transition-colors py-1 px-3 rounded text-sm font-medium"
            >
              Log Out
            </button>
          </>
        ) : (
          <button
            onClick={() => loginWithRedirect()}
            className="bg-blue-500 hover:bg-blue-600 transition-colors py-1 px-3 rounded text-sm font-medium"
          >
            Log In / Sign Up
          </button>
        )}
      </div>
    </nav>
  );
};

// --- ২. হোম পেজ ---
const HomePage = () => (
  <div className="p-8 text-center bg-gray-100 text-gray-800 min-h-[90vh] flex flex-col items-center justify-center">
    <h1 className="text-4xl font-extrabold mb-4">Welcome to OnyxDrift Social App</h1>
    <p className="text-lg text-gray-600">
        একটি অ্যাকাউন্ট তৈরি বা লগইন করার জন্য 'Log In / Sign Up' বাটন ব্যবহার করুন।
    </p>
  </div>
);

// --- ৩. মূল অ্যাপ্লিকেশন কম্পোনেন্ট ---

const App: React.FC = () => {
  const { handleRedirectCallback } = useAuth0();

  // Auth0/SPA-এর জন্য প্রাথমিক কলব্যাক হ্যান্ডলিং
  useEffect(() => {
    if (window.location.search.includes('code') || window.location.search.includes('error')) {
      handleRedirectCallback(window.location.href);
    }
  }, [handleRedirectCallback]);

  return (
    // মূল div
    <div className="bg-white min-h-screen"> 
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* ১. হোম রুট */}
          <Route path="/" element={<HomePage />} />
          
          {/* ২. প্রোফাইল সেটআপ রুট (নতুন ব্যবহারকারীদের জন্য) */}
          {/* <Route path="/setup-profile" element={<SetupProfilePage />} /> */}
          
          {/* আপনার অন্যান্য আসল রুটগুলি এখানে যুক্ত করুন */}
          {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
          
          {/* ৩. 404 Not Found Page */}
          <Route path="*" element={
            <div className="p-10 text-center">
                <h1 className="text-4xl mt-20 text-red-600 font-bold">404 - Page Not Found</h1>
                <p className="text-gray-500 mt-2">আপনি যে পৃষ্ঠাটি খুঁজছেন, তা পাওয়া যায়নি।</p>
                <Link to="/" className="text-blue-500 hover:underline mt-4 block">হোম পেজে ফিরে যান</Link>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
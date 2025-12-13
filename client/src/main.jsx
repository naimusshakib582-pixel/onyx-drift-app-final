// src/main.jsx বা src/Root.jsx

import React from "react";
import ReactDOM from 'react-dom/client'; // যদি main.jsx হয়
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import App from "./App.jsx"; // App কে আমরা AppRoutes ফাংশন দ্বারা প্রতিস্থাপন করছি
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react"; 

// ডামি কম্পোনেন্টগুলি আমদানি করুন (আপনার আসল ফাইলে এগুলো লাগবে)
import LoginComponent from "./components/LoginComponent"; // নিশ্চিত করুন পথটি সঠিক
import { Navbar, Home, Profile, Pages, RegisterComponent } from './App'; // অনুমান করা হচ্ছে App এ এগুলো আছে


// --- 1. Auth0 Provider এবং Credentials ---
// ভেরিয়েবলগুলি আপনার environment variable (.env.local বা Cloudflare Pages) থেকে আসবে
const AUTH0_DOMAIN = import.meta.env.VITE_REACT_APP_AUTH0_DOMAIN || "dev-6d0nxccsaycctfl1.us.auth0.com";
const AUTH0_CLIENT_ID = import.meta.env.VITE_REACT_APP_AUTH0_CLIENT_ID;
const API_AUDIENCE = 'https://onyx-drift-api.com'; // ✅ আপনার সঠিক API Identifier

// --- 2. মূল রাউটিং লজিক (Auth0 হুক ব্যবহার করে) ---
// এটি আপনার পূর্বের App লজিক ধারণ করবে
function AppRoutes() {
    const { isAuthenticated, isLoading, user } = useAuth0();
    
    if (isLoading) {
        // Auth0 স্টেট লোড হওয়ার সময় লোডিং দেখান
        return <div className="text-center mt-20 text-3xl font-bold text-blue-600">Loading authentication state...</div>;
    }

    return (
        <Router>
            <Navbar /> 
            <div className="container mx-auto p-4">
                <Routes>
                    {/* Protected Routes: লগইন না থাকলে LoginComponent দেখাবে */}
                    <Route 
                        path="/feed" 
                        element={isAuthenticated ? <Home user={user} /> : <LoginComponent />} 
                    />
                    <Route 
                        path="/" 
                        element={isAuthenticated ? <Home user={user} /> : <LoginComponent />} 
                    />
                    
                    {/* অন্যান্য সুরক্ষিত রুট */}
                    <Route 
                        path="/profile" 
                        element={isAuthenticated ? <Profile user={user} /> : <Navigate to="/feed" replace />} 
                    />
                    
                    {/* লগইন রুটটি শুধুমাত্র Auth0 লগইন বাটন দেখাবে */}
                    <Route path="/login" element={<LoginComponent />} /> 
                    
                    {/* Auth0 এর জন্য Callback Route (Auth0 SDK এটি নিজেই হ্যান্ডেল করবে, কিন্তু Route থাকা ভালো) */}
                    <Route path="/callback" element={<div>Handling Auth0 redirect...</div>} />
                    
                    {/* অন্যান্য পাবলিক রুট */}
                    <Route path="/register" element={<RegisterComponent />} /> 
                </Routes>
            </div>
        </Router>
    );
}

// --- 3. Root কম্পোনেন্ট (Auth0Provider দ্বারা AppRoutes মোড়ানো) ---
function Root() {
    return (
        <Auth0Provider
            domain={AUTH0_DOMAIN}
            clientId={AUTH0_CLIENT_ID}
            authorizationParams={{
                redirect_uri: window.location.origin + "/feed", // লগইনের পর /feed এ যাবে
                audience: API_AUDIENCE // ✅ সুরক্ষিত API কলের জন্য Audience
            }}
        >
            {/* AppRoutes কে App হিসেবে রেন্ডার করা হলো */}
            <AppRoutes /> 
        </Auth0Provider>
    );
}

// যদি এটি main.jsx হয়, তাহলে নিচের মতো রেন্ডার করতে হবে:
/*
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Root />
    </React.StrictMode>,
);
*/

// যদি এটি Root.jsx হয়, তবে এটিই ডিফল্ট এক্সপোর্ট হবে:
export default Root;
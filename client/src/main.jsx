// src/main.jsx বা src/Root.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.jsx"; 
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react"; // Auth0 আমদানি করুন
// ... অন্যান্য আমদানি ...


// Auth0 Provider দ্বারা অ্যাপ মোড়ানো
function Root() {
    // এখানে আপনার Auth0 Credentials ব্যবহার করুন
    const AUTH0_DOMAIN = import.meta.env.VITE_REACT_APP_AUTH0_DOMAIN; // বা process.env.REACT_APP_AUTH0_DOMAIN
    const AUTH0_CLIENT_ID = import.meta.env.VITE_REACT_APP_AUTH0_CLIENT_ID;

    // টপ-লেভেল কম্পোনেন্ট
    return (
        <Auth0Provider
            domain={AUTH0_DOMAIN}
            clientId={AUTH0_CLIENT_ID}
            authorizationParams={{
                redirect_uri: window.location.origin + "/feed", // লগইনের পর কোথায় যাবে
                audience: "YOUR_API_IDENTIFIER_FROM_AUTH0" // সুরক্ষিত API কলের জন্য
            }}
        >
            <App />
        </Auth0Provider>
    );
}

// এই নতুন App কম্পোনেন্টটি আপনার পূর্বের App লজিক (Router/Routes) ধারণ করবে
function AppRoutes() {
    const { isAuthenticated, isLoading, user } = useAuth0();
    
    if (isLoading) {
        return <div className="text-center mt-20 text-xl">Loading authentication state...</div>;
    }

    // ⭐ লগইন কম্পোনেন্টটি Auth0 দ্বারা প্রতিস্থাপিত হবে
    return (
        <Router>
            <Navbar /> 
            <div className="container mx-auto p-4">
                <Routes>
                    {/* Protected Routes এখন isAuthenticated দ্বারা সুরক্ষিত হবে */}
                    <Route path="/feed" element={isAuthenticated ? <Home user={user} /> : <LoginComponent />} />
                    
                    {/* অন্যান্য সুরক্ষিত রুট */}
                    <Route path="/profile" element={isAuthenticated ? <Profile user={user} /> : <Navigate to="/feed" />} />
                    
                    {/* লগইন রুটটি শুধুমাত্র Auth0 লগইন বাটন দেখাবে */}
                    <Route path="/login" element={<LoginComponent />} /> 
                    
                    {/* Auth0 এর জন্য Callback Route */}
                    <Route path="/callback" element={<div>Handling Auth0 redirect...</div>} />
                    
                    {/* অন্যান্য পাবলিক রুট */}
                    <Route path="/register" element={<RegisterComponent />} /> 
                </Routes>
            </div>
        </Router>
    );
}


export default Root;
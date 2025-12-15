import React, { useState, useCallback } from "react";
// React Router v6 ব্যবহার করা হয়েছে
// NavLink আমদানি করা হলো নেভিগেশন লিংক তৈরির জন্য
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from "react-router-dom";
// Auth0 থেকে প্রয়োজনীয় হুক আমদানি করুন
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"; 

// --- API Configuration ---
// সুরক্ষিত ব্যাকএন্ডের ভিত্তি URL
const RENDER_API_URL = "https://onyx-drift-api-server.onrender.com"; 
const LOCAL_API_URL = "http://localhost:5000";
// হোস্টনাম অনুযায়ী API URL নির্বাচন
const API_BASE_URL = window.location.hostname === "localhost" ? LOCAL_API_URL : RENDER_API_URL;


// --- 1. Navbar Component (সংশোধিত) ---
const Navbar = () => {
    // Auth0 হুক ব্যবহার করে অবস্থা ও ফাংশন অ্যাক্সেস
    const { isAuthenticated, logout, loginWithRedirect } = useAuth0();

    const AuthButton = () => {
        if (isAuthenticated) {
            return (
                <button 
                    // লগআউট করার পরে ব্যবহারকারীকে বেস URL-এ (/) ফিরিয়ে আনা হবে
                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-150"
                >
                    Logout
                </button>
            );
        }
        return (
            <button 
                onClick={() => loginWithRedirect()} // Auth0 Universal Login Page এ রিডাইরেক্ট করবে
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-150"
            >
                Login
            </button>
        );
    };

    return (
        <div className="bg-blue-600 p-4 text-white shadow-lg">
            <div className="flex justify-between items-center container mx-auto">
                <h1 className="text-xl font-bold">OnyxDrift Social App</h1>
                
                {/* --- নেভিগেশন লিংক যুক্ত করা হলো --- */}
                <nav className="flex space-x-4 ml-auto mr-4">
                    {/* Home/Landing Page লিংক */}
                    <NavLink 
                        to="/" 
                        className={({ isActive }) => 
                            `hover:text-gray-200 transition duration-150 ${isActive ? 'font-extrabold text-white underline' : 'font-normal'}`
                        }
                    >
                        Home
                    </NavLink>
                    
                    {/* সুরক্ষিত রুট লিংকগুলি শুধুমাত্র লগইন করা ব্যবহারকারীর জন্য */}
                    {isAuthenticated && (
                        <>
                            <NavLink 
                                to="/feed" 
                                className={({ isActive }) => 
                                    `hover:text-gray-200 transition duration-150 ${isActive ? 'font-extrabold text-white underline' : 'font-normal'}`
                                }
                            >
                                Feed
                            </NavLink>
                            <NavLink 
                                to="/profile" 
                                className={({ isActive }) => 
                                    `hover:text-gray-200 transition duration-150 ${isActive ? 'font-extrabold text-white underline' : 'font-normal'}`
                                }
                            >
                                Profile
                            </NavLink>
                            <NavLink 
                                to="/chat" 
                                className={({ isActive }) => 
                                    `hover:text-gray-200 transition duration-150 ${isActive ? 'font-extrabold text-white underline' : 'font-normal'}`
                                }
                            >
                                Chat
                            </NavLink>
                        </>
                    )}
                </nav>
                
                <AuthButton />
            </div>
        </div>
    );
};


// --- 2. ProtectedRoute Component ---
// এই কম্পোনেন্টটি ব্যবহার করে যেকোনো রুটকে সুরক্ষা দেওয়া যায়
const ProtectedRoute = ({ component: Component }) => {
    // withAuthenticationRequired দ্বারা র্যাপ করা হয়েছে
    const WrappedComponent = withAuthenticationRequired(Component, {
        onRedirecting: () => <div className="text-center mt-20">Loading Authentication...</div>,
    });
    // ProtectedRoute এর মধ্যে Auth0 এর লজিক সহ কম্পোনেন্ট রেন্ডার করা হয়
    return <WrappedComponent />;
};


// --- 3. Home Component (Protected Feed) ---
const Home = () => {
    const { getAccessTokenSilently } = useAuth0(); 
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProtectedPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // অ্যাক্সেস টোকেন সংগ্রহ
            const accessToken = await getAccessTokenSilently({
                authorizationParams: {
                    // এটি আপনার ব্যাকএন্ড API এর আইডেন্টিফায়ার
                    audience: 'https://onyx-drift-api.com', 
                },
            });

            // সুরক্ষিত API কল
            const apiUrl = `${API_BASE_URL}/posts`; 
            
            const response = await fetch(apiUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // টোকেনটি Authorization Header-এ যুক্ত করা
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                // 401 Unauthorized এরর এখানে ক্যাচ হবে যদি ব্যাকএন্ড টোকেন প্রত্যাখ্যান করে
                throw new Error(`API call failed: ${response.status} ${response.statusText}. Check server logs.`);
            }

            const data = await response.json();
            setPosts(data.data); 
            
        } catch (err) {
            console.error("Error accessing protected API:", err);
            // নেটওয়ার্ক ত্রুটির মেসেজটি সেট করা হচ্ছে
            setError(err.message || "Network request failed.");
        } finally {
            setLoading(false);
        }
    }, [getAccessTokenSilently]);

    React.useEffect(() => {
        // লগইন সফল হলে, এই কম্পোনেন্ট মাউন্ট হবে এবং ডেটা ফেস করবে
        fetchProtectedPosts();
    }, [fetchProtectedPosts]);

    if (loading) return <div className="text-center mt-20">Loading Feed...</div>;
    // ডেটা লোড করার সময় কোনো API ত্রুটি দেখা দিলে
    if (error) return <div className="text-red-600 text-center mt-20">Error loading data: {error}</div>;


    return (
        <div className="text-center mt-8 font-semibold text-gray-800">
            <h1 className="text-3xl">Welcome Home (Protected Feed)</h1>
            <h2 className="text-xl mt-4 text-green-700">Protected Data Loaded Successfully!</h2>
            <p className="mt-2 text-gray-500">Total Posts: {posts.length}</p>
        </div>
    );
};

// --- অন্যান্য কম্পোনেন্ট ---
const Profile = () => {
    const { user } = useAuth0();
    return (
        <div className="text-center mt-8">
            <h2 className="text-2xl font-medium">User Profile</h2>
            {/* ইউজার ডেটা দেখানোর জন্য */}
            <p className="text-gray-600 mt-2">Displaying profile for User: **{user?.name}**</p>
            <p className="text-sm text-gray-500">Email: {user?.email}</p>
        </div>
    );
};

// Pages কম্পোনেন্টে props-এ নাম পেলে সেটি দেখাবে
const Pages = ({ name }) => (<h2 className="text-2xl text-center mt-8 font-medium">{name} Page Content</h2>);

const LandingPage = () => (
    <div className="text-center mt-20">
        <h1 className="text-4xl font-bold text-gray-800">OnyxDrift Social App</h1>
        <p className="text-lg text-gray-600 mt-4">Please use the **Login** button above to authenticate.</p>
    </div>
);

const Chat = () => (<Pages name="Chat" />); 


// --- 4. Main App Component (AppContent) ---
// সমস্ত রাউটিং লজিক এখানে
function AppContent() {
    return (
        // Router শুধুমাত্র একবার ব্যবহার করা হয়েছে
        <Router>
            <Navbar />
            <div className="container mx-auto p-4">
                <Routes>
                    {/* Public Route: লগইন সফল হলে Auth0 এখানে ফিরে আসবে */}
                    <Route path="/" element={<LandingPage />} />
                    
                    {/* সুরক্ষিত রুটস */}
                    <Route path="/feed" element={<ProtectedRoute component={Home} />} />
                    <Route path="/profile" element={<ProtectedRoute component={Profile} />} />
                    
                    {/* অন্যান্য সুরক্ষিত রুটস */}
                    {/* এখানে Pages কম্পোনেন্টকে র্যাপ করার জন্য একটি ফাংশন ব্যবহার করা হয়েছে */}
                    <Route path="/friends" element={<ProtectedRoute component={() => <Pages name="Friends" />} />} />
                    <Route path="/groups" element={<ProtectedRoute component={() => <Pages name="Groups" />} />} />
                    <Route path="/events" element={<ProtectedRoute component={() => <Pages name="Events" />} />} />
                    <Route path="/marketplace" element={<ProtectedRoute component={() => <Pages name="Marketplace" />} />} />
                    <Route path="/chat" element={<ProtectedRoute component={Chat} />} />
                    
                    {/* পুরোনো /login এবং /register রুটগুলিকে হোমে রিডাইরেক্ট করা হলো */}
                    <Route path="/login" element={<Navigate to="/" replace />} /> 
                    <Route path="/register" element={<Navigate to="/" replace />} /> 

                    {/* 404 হ্যান্ডলিং (যদি কোনো রুট ম্যাচ না করে) */}
                    <Route path="*" element={<h2 className="text-red-500 text-4xl text-center mt-20">404 - Page Not Found</h2>} />
                </Routes>
            </div>
        </Router>
    );
}


// --- 5. Root Component (Auth0Provider Wrap) ---
// এটি আপনার প্রধান কম্পোনেন্ট যা main.jsx থেকে কল করা হয়
function App() {
    // === Auth0 কনফিগারেশন ভ্যালুগুলি (প্রকৃত Client ID ব্যবহার করুন) ===
    const AUTH0_DOMAIN = 'dev-6d0nxccsaycctfl1.us.auth0.com'; 
    // IMPORTANT: আপনার প্রকৃত Client ID দিন
    const AUTH0_CLIENT_ID = 'tcfTAHv3K8KC1VwtZQrqIbqsZRN2PJFr'; 
    const API_AUDIENCE = 'https://onyx-drift-api.com'; 

    // মনে রাখবেন: useAuth0() হুকটি অবশ্যই Auth0Provider-এর ভেতরে থাকতে হবে। 
    // App কম্পোনেন্টটি Auth0Provider এর আগে রেন্ডার হচ্ছে, তাই isLoading/error হ্যান্ডলিং এখান থেকে সরিয়ে AppContent-এ বা main.jsx-এ ব্যবহার করাই শ্রেয়।
    // আপাতত, আমি Auth0Provider এর আগে এটি চেক না করার জন্য useAuth0() হুকটি এখানে মন্তব্য করছি।
    
    // const { isLoading, error } = useAuth0(); 

    // if (error) { ... }
    // if (isLoading) { ... }


    return (
        <Auth0Provider
            domain={AUTH0_DOMAIN}
            clientId={AUTH0_CLIENT_ID}
            authorizationParams={{
                redirect_uri: window.location.origin, // লগইন সফল হলে বেস রুটে ফিরে আসে (/)
                audience: API_AUDIENCE, // API Access Token অনুরোধ
            }}
        >
            {/* Auth0 লোডিং এবং এরর চেক করার জন্য একটি র্যাপার কম্পোনেন্ট ব্যবহার করা উচিত 
                যাতে useAuth0() কলটি Auth0Provider এর ভেতরে থাকে।
            */}
            <AuthWrapper>
                {/* AppContent এর ভিতরে BrowserRouter আছে */}
                <AppContent />
            </AuthWrapper>
        </Auth0Provider>
    );
}

// Auth0 লোডিং ও এরর হ্যান্ডলিং এর জন্য একটি নতুন র্যাপার কম্পোনেন্ট
const AuthWrapper = ({ children }) => {
    const { isLoading, error } = useAuth0();

    if (error) {
        return <div className="text-red-600 text-center mt-20">Auth0 Error: {error.message}</div>;
    }

    if (isLoading) {
        return <div className="text-center mt-20">Loading authentication data...</div>;
    }
    
    return children;
}

// এই কম্পোনেন্টটি main.jsx থেকে ইম্পোর্ট করা হবে (যদি আপনি এটি App.jsx এ রাখেন)
export default App;
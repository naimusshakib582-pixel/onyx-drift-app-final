import React, { useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from "react-router-dom";
import { useAuth0, withAuthenticationRequired, Auth0Provider } from "@auth0/auth0-react"; 

// --- API Configuration ---
const RENDER_API_URL = "https://onyx-drift-api-server.onrender.com"; 
const LOCAL_API_URL = "http://localhost:5000";
const API_BASE_URL = window.location.hostname === "localhost" ? LOCAL_API_URL : RENDER_API_URL;
const API_AUDIENCE = 'https://onyx-drift-api.com'; 

// --- Navbar Component ---
const Navbar = () => {
    const { isAuthenticated, logout, loginWithRedirect } = useAuth0();

    return (
        <div className="bg-blue-600 p-4 text-white shadow-lg">
            <div className="flex justify-between items-center container mx-auto">
                <h1 className="text-xl font-bold">OnyxDrift</h1>
                <nav className="flex space-x-4 ml-auto mr-4">
                    <NavLink to="/" className={({ isActive }) => `hover:text-gray-200 transition ${isActive ? 'font-extrabold underline' : ''}`}>Home</NavLink>
                    {isAuthenticated && (
                        <>
                            <NavLink to="/dashboard" className={({ isActive }) => `hover:text-gray-200 transition ${isActive ? 'font-extrabold underline' : ''}`}>Dashboard</NavLink>
                            <NavLink to="/feed" className={({ isActive }) => `hover:text-gray-200 transition ${isActive ? 'font-extrabold underline' : ''}`}>Feed</NavLink>
                            <NavLink to="/profile" className={({ isActive }) => `hover:text-gray-200 transition ${isActive ? 'font-extrabold underline' : ''}`}>Profile</NavLink>
                        </>
                    )}
                </nav>
                {isAuthenticated ? (
                    <button 
                        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} 
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded font-bold"
                    >
                        Logout
                    </button>
                ) : (
                    <button 
                        onClick={() => loginWithRedirect()} 
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded font-bold"
                    >
                        Login
                    </button>
                )}
            </div>
        </div>
    );
};

// --- ProtectedRoute Component ---
const ProtectedRoute = ({ component: Component }) => {
    const WrappedComponent = withAuthenticationRequired(Component, {
        onRedirecting: () => <div className="text-center mt-20 text-xl">Redirecting to login...</div>,
    });
    return <WrappedComponent />;
};

// --- Home/Feed Component ---
const HomeFeed = () => {
    const { getAccessTokenSilently } = useAuth0(); 
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = useCallback(async () => {
        try {
            const token = await getAccessTokenSilently({ authorizationParams: { audience: API_AUDIENCE } });
            const response = await fetch(`${API_BASE_URL}/posts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setPosts(data.data || []);
        } catch (err) {
            console.error("API Error:", err);
        } finally {
            setLoading(false);
        }
    }, [getAccessTokenSilently]);

    React.useEffect(() => { fetchPosts(); }, [fetchPosts]);

    if (loading) return <div className="text-center mt-20">Loading data...</div>;

    return (
        <div className="text-center mt-10">
            <h2 className="text-3xl font-bold text-gray-800">Your Feed & Dashboard</h2>
            <p className="mt-4 text-green-600 font-semibold">Protected Data Loaded: {posts.length} Posts</p>
        </div>
    );
};

// --- Static Pages ---
const LandingPage = () => (
    <div className="text-center mt-20">
        <h1 className="text-5xl font-extrabold text-blue-700">Welcome to OnyxDrift</h1>
        <p className="text-gray-600 mt-6 text-lg">Your social journey starts here. Please login to continue.</p>
    </div>
);

const Profile = () => {
    const { user } = useAuth0();
    return (
        <div className="text-center mt-10 p-6 bg-white shadow-md rounded-lg max-w-md mx-auto">
            <img src={user?.picture} alt="profile" className="w-24 h-24 rounded-full mx-auto" />
            <h2 className="text-2xl font-bold mt-4">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
        </div>
    );
};

// --- Main App Logic ---
function AppContent() {
    return (
        <Router>
            <Navbar />
            <div className="container mx-auto p-4">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    
                    {/* গুরুত্বপূর্ণ: এখানে /dashboard এবং /feed দুটিই HomeFeed দেখাচ্ছে */}
                    <Route path="/dashboard" element={<ProtectedRoute component={HomeFeed} />} />
                    <Route path="/feed" element={<ProtectedRoute component={HomeFeed} />} />
                    <Route path="/profile" element={<ProtectedRoute component={Profile} />} />
                    
                    <Route path="/login" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<div className="text-center mt-20"><h2 className="text-red-500 text-4xl font-bold">404 - Page Not Found</h2><p className="mt-4">The route you are looking for is not defined.</p></div>} />
                </Routes>
            </div>
        </Router>
    );
}

const AuthWrapper = ({ children }) => {
    const { isLoading, error } = useAuth0();
    if (error) return <div className="text-center mt-20 text-red-600">Auth0 Error: {error.message}</div>;
    if (isLoading) return <div className="text-center mt-20 text-blue-500 text-xl font-bold">Authenticating...</div>;
    return children;
};

export default function App() {
    return (
        <Auth0Provider
            domain="dev-6d0nxccsaycctfl1.us.auth0.com"
            clientId="tcfTAHv3K8KC1VwtZQrqIbqsZRN2PJFr"
            authorizationParams={{
                redirect_uri: window.location.origin,
                audience: API_AUDIENCE,
            }}
            useRefreshTokens={true}
            cacheLocation="localstorage"
        >
            <AuthWrapper>
                <AppContent />
            </AuthWrapper>
        </Auth0Provider>
    );
}
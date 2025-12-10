import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// Note: Assuming these components exist in the user's project structure
// import Navbar from "./components/Navbar"; 
// import Home from "./pages/Home";
// import Friends from "./pages/Friends";
// import Groups from "./pages/Groups";
// import Events from "./pages/Events";
// import Marketplace from "./pages/Marketplace";
// import ProtectedRoute from "./components/ProtectedRoute"; 
// import Chat from "./components/Chat/Chat";
// import Profile from "./components/Profile";
// import { AuthProvider } from "./context/AuthContext";
import axios from "axios";

// --- API Configuration ---
// প্রক্সি সার্ভিসের URL ব্যবহার করা হচ্ছে
const RENDER_API_URL = "https://onyx-drift-api-server.onrender.com"; // আপনার রেন্ডার করা ব্যাকএন্ড URL
const LOCAL_API_URL = "http://localhost:5000";

// কোন URL ব্যবহার করা হবে, তা নির্ধারণ করা হলো।
const API_BASE_URL = window.location.hostname === "localhost" ? LOCAL_API_URL : RENDER_API_URL;


// Dummy Components for demonstration (since full project structure is not provided)
const Navbar = () => (<div className="bg-blue-600 p-4 text-white text-center">OnyxDrift Nav</div>);
const Home = () => (<h1 className="text-3xl text-center mt-8">Welcome Home (Feed)</h1>);
const ProtectedRoute = ({ children }) => {
    const { userId } = useAuth(); // Assuming useAuth exists
    if (!userId) return <Navigate to="/login" />;
    return children;
};
const Chat = ({ userId, receiverId }) => (<h2 className="text-xl text-center mt-4">Chat with {receiverId} (User ID: {userId})</h2>);
const Profile = ({ userId }) => (<h2 className="text-xl text-center mt-4">Profile for User: {userId}</h2>);
const AuthContext = React.createContext({ userId: null, setUserId: () => {} }); // Changed default userId to null
const useAuth = () => React.useContext(AuthContext);
const AuthProvider = ({ children }) => {
    const [userId, setUserId] = useState(null); // Actual state management
    const value = React.useMemo(() => ({ userId, setUserId }), [userId]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
const Pages = ({ name }) => (<h2 className="text-xl text-center mt-4">{name} Page</h2>);
// --- End Dummy Components ---


function App() {
    // Auth & Demo state
    const [userId, setUserId] = useState(null); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState(""); // Error message state

    const [receiverId] = useState("user2"); // demo chat

    // Login function
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError(""); // Clear previous errors
        try {
            // API_BASE_URL ব্যবহার করা হয়েছে
            const res = await axios.post(`${API_BASE_URL}/api/login`, {
                email,
                password,
            });
            // সার্ভার থেকে আসা user অবজেক্ট ব্যবহার করা হয়েছে
            setUserId(res.data.user.id); 
        } catch (err) {
            console.error("Login failed:", err.response?.data?.message || err.message);
            // ইউজার-ফ্রেন্ডলি মেসেজ দেখানো
            setLoginError(err.response?.data?.message || "Login failed. Check server connection.");
        }
    };

    // যদি userId না থাকে, তাহলে Login ফর্ম দেখাবে।
    if (!userId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
                    <h1 className="text-3xl font-extrabold text-blue-600 mb-6 text-center">OnyxDrift Login</h1>
                    <form
                        onSubmit={handleLogin}
                        className="flex flex-col gap-4"
                    >
                        {loginError && (
                            <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm">
                                {loginError}
                            </div>
                        )}
                        <input
                            type="email"
                            placeholder="Email (test@example.com)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-150"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password (123456)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-150"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
                        >
                            Login
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-500 mt-4">
                        Demo Credentials: test@example.com / 123456
                    </p>

                    {/* ⭐ এটিই হলো আপনার অনুপস্থিত "Create Account" লিঙ্ক ⭐ */}
                    <p className="text-center text-sm mt-3">
                        অ্যাকাউন্ট নেই? {" "}
                        <a 
                            href="/register" 
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            একটি অ্যাকাউন্ট তৈরি করুন
                        </a>
                    </p>

                </div>
            </div>
        );
    }

    // Main App after successful login
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <div className="container mx-auto p-4">
                    <Routes>
                        {/* Note: The ProtectedRoute component is dummy here, assuming real implementation in user's project */}
                        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                        <Route path="/feed" element={<ProtectedRoute><Home /></ProtectedRoute>} /> {/* Added /feed route for clarity */}
                        <Route path="/friends" element={<ProtectedRoute><Pages name="Friends" /></ProtectedRoute>} />
                        <Route path="/groups" element={<ProtectedRoute><Pages name="Groups" /></ProtectedRoute>} />
                        <Route path="/events" element={<ProtectedRoute><Pages name="Events" /></ProtectedRoute>} />
                        <Route path="/marketplace" element={<ProtectedRoute><Pages name="Marketplace" /></ProtectedRoute>} />
                        <Route path="/chat" element={<Chat userId={userId} receiverId={receiverId} />} />
                        <Route path="/profile" element={<Profile userId={userId} />} />
                        
                        {/* Note: Registration component is needed here for /register path */}
                        <Route path="/register" element={<Pages name="Registration" />} />
                        
                        {/* লগইন সফল হলে /login এ গেলে / এ রিডাইরেক্ট করবে */}
                        <Route path="/login" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
import React, { useState, useCallback, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

// --- API Configuration ---
const RENDER_API_URL = "https://onyx-drift-api-server.onrender.com";
const LOCAL_API_URL = "http://localhost:5000";
// পরিবেশের উপর ভিত্তি করে সঠিক URL নির্ধারণ
// VITE ব্যবহার করলে, এটি হবে: import.meta.env.VITE_RENDER_API_URL
const API_BASE_URL = window.location.hostname === "localhost" ? LOCAL_API_URL : RENDER_API_URL;

// --- Dummy Components and Context (Keep these for functionality) ---

// 1. Navbar Component
const Navbar = () => (
    <div className="bg-blue-600 p-4 text-white shadow-lg">
        <div className="flex justify-between items-center container mx-auto">
            <h1 className="text-xl font-bold">OnyxDrift Social App</h1>
            {/* এখানে আপনি লগআউট বাটন যোগ করতে পারেন */}
        </div>
    </div>
);

// Home (Feed)
const Home = () => (<h1 className="text-3xl text-center mt-8 font-semibold text-gray-800">Welcome Home (Feed)</h1>);
// Chat
const Chat = ({ userId, receiverId }) => (
    <div className="text-center mt-8">
        <h2 className="text-2xl font-medium">Chat Application</h2>
        <p className="text-gray-600 mt-2">Currently chatting with **{receiverId}** (Your ID: **{userId}**)</p>
    </div>
);
// Profile
const Profile = ({ userId }) => (
    <div className="text-center mt-8">
        <h2 className="text-2xl font-medium">User Profile</h2>
        <p className="text-gray-600 mt-2">Displaying profile for User ID: **{userId}**</p>
    </div>
);
// Other Pages
const Pages = ({ name }) => (<h2 className="text-2xl text-center mt-8 font-medium">{name} Page Content</h2>);


// 2. Auth Context Setup
const AuthContext = React.createContext({ userId: null, setUserId: () => {} });
const useAuth = () => React.useContext(AuthContext);

// 3. AuthProvider Component
const AuthProvider = ({ children }) => {
    const [userId, setUserId] = useState(null); 
    // performance optimization
    const value = useMemo(() => ({ userId, setUserId }), [userId]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. ProtectedRoute Component
const ProtectedRoute = ({ children }) => {
    const { userId } = useAuth();
    if (!userId) {
        // যদি userId না থাকে, তাহলে /login এ নিয়ে যাবে
        return <Navigate to="/login" replace />;
    }
    // যদি userId থাকে, তাহলে চাইল্ড কম্পোনেন্ট দেখাবে
    return children;
};
// --- End Dummy Components ---

// 5. LoginComponent
const LoginComponent = () => {
    const { userId, setUserId } = useAuth(); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState(""); 
    
    // ⭐ Fix: লগইন সফল হলে, user feed এ Navigate করবে
    if (userId) {
        return <Navigate to="/feed" replace />;
    }
    

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError(""); 
        try {
            // API কল: http://localhost:5000/api/login বা Render URL/api/login
            const res = await axios.post(`${API_BASE_URL}/api/login`, {
                email,
                password,
            });
            // লগইন সফল: userId সেভ করুন
            setUserId(res.data.user.id); 
        } catch (err) {
            // ত্রুটি হ্যান্ডলিং
            setLoginError(err.response?.data?.message || "Login failed. Check server connection.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
                <h1 className="text-3xl font-extrabold text-blue-600 mb-6 text-center">OnyxDrift Login V2</h1>
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
                <p className="text-center text-sm mt-3">
                    Don't have an account? {" "}
                    <a 
                        href="/register" 
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Create an Account
                    </a>
                </p>
            </div>
        </div>
    );
}

// 6. Registration Component
const RegisterComponent = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm text-center">
            <h1 className="text-3xl font-extrabold text-green-600 mb-6">Registration Page V4</h1> 
            <p className="text-gray-700">Registration form goes here.</p>
            <p className="text-sm mt-4">
                Already have an account? {" "} 
                <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                    Login
                </a>
            </p>
        </div>
    </div>
);


// 7. Main App Component
function App() {
    const [receiverId] = useState("user2");
    const { userId } = useAuth(); 

    return (
        <Router>
            <Navbar />
            <div className="container mx-auto p-4">
                <Routes>
                    {/* Protected Routes (লগইন ছাড়া অ্যাক্সেস করা যাবে না) */}
                    <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/feed" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/friends" element={<ProtectedRoute><Pages name="Friends" /></ProtectedRoute>} />
                    <Route path="/groups" element={<ProtectedRoute><Pages name="Groups" /></ProtectedRoute>} />
                    <Route path="/events" element={<ProtectedRoute><Pages name="Events" /></ProtectedRoute>} />
                    <Route path="/marketplace" element={<ProtectedRoute><Pages name="Marketplace" /></ProtectedRoute>} />
                    <Route path="/chat" element={<ProtectedRoute><Chat userId={userId} receiverId={receiverId} /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile userId={userId} /></ProtectedRoute>} />
                    
                    {/* Public Routes (যেকেউ অ্যাক্সেস করতে পারবে) */}
                    <Route path="/login" element={<LoginComponent />} /> 
                    <Route path="/register" element={<RegisterComponent />} /> 
                </Routes>
            </div>
        </Router>
    );
}

// 8. Root Component (Auth Context Wrap)
function Root() {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}

export default Root;
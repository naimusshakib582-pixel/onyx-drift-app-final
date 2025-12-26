import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Profile from "./components/Profile";

/* Navbar */
const Navbar = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  return (
    <div className="bg-blue-600 p-4 text-white flex gap-4">
      <NavLink to="/">Home</NavLink>
      {isAuthenticated && (
        <>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </>
      )}
      {isAuthenticated ? (
        <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
          Logout
        </button>
      ) : (
        <button onClick={() => loginWithRedirect()}>Login</button>
      )}
    </div>
  );
};

/* Protected Route */
const ProtectedRoute = ({ component }) => {
  const Component = withAuthenticationRequired(component, { onRedirecting: () => <div>Redirecting...</div> });
  return <Component />;
};

/* App */
export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
        <Route path="/profile" element={<ProtectedRoute component={Profile} />} />
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>
    </>
  );
}

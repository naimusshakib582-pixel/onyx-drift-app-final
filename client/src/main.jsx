import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./app.jsx";
import { AuthProvider } from "./context/AuthContext"; 
import "./index.css";

// কনফিগারেশন
const AUTH0_DOMAIN = "dev-6d0nxccsaycctfl1.us.auth0.com";
const AUTH0_CLIENT_ID = "tcfTAHv3K8KC1VwtZQrqIbqsZRN2PJFr";
const API_URL = "https://onyx-drift-app-final.onrender.com";

// এই লাইনটি আগে ছিল না, তাই এরর দিচ্ছিল
const API_AUDIENCE = `https://${AUTH0_DOMAIN}/api/v2/`; 

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: API_AUDIENCE, // এখন এটি কাজ করবে
        scope: "openid profile email offline_access"
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </Auth0Provider>
  </React.StrictMode>
);
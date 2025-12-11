// src/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';

const AUTH0_DOMAIN = "{onyx-drift}"; // আপনার Auth0 ডোমেইন
const AUTH0_CLIENT_ID = "{XLOf0b4EYm4JhJ2KUQ4mfWgMG1WDeCu4}"; // আপনার Auth0 Client ID
const PACKAGE_ID = com.onyxdrift.app://dev-1a2b3c4d.us.auth0.com/capacitor/com.onyxdrift.app/callback""; // আপনার capacitor.config.ts এর appId

const root = createRoot(document.getElementById('root')!);

root.render(
  <Auth0Provider
    domain={AUTH0_DOMAIN}
    clientId={AUTH0_CLIENT_ID}
    useRefreshTokens={true}
    useRefreshTokensFallback={false}
    authorizationParams={{
      // Auth0 Callback URL
      redirect_uri: `${PACKAGE_ID}://${AUTH0_DOMAIN}/capacitor/${PACKAGE_ID}/callback`
    }}
  >
    <App />
  </Auth0Provider>
);
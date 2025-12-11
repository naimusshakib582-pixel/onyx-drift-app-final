// src/components/LogoutButton.tsx
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Browser } from '@capacitor/browser';
import { IonButton } from '@ionic/react';

const PACKAGE_ID = "YOUR_PACKAGE_ID"; // আপনার capacitor.config.ts এর appId
const AUTH0_DOMAIN = "{yourDomain}"; // আপনার Auth0 ডোমেইন
const logoutUri = `${PACKAGE_ID}://${AUTH0_DOMAIN}/capacitor/${PACKAGE_ID}/callback`;

const LogoutButton: React.FC = () => {
  const { logout } = useAuth0();

  const doLogout = async () => {
    await logout({
      logoutParams: {
        returnTo: logoutUri, // লগআউটের পর এখানে ফেরত আসবে
      },
      async openUrl(url) {
         // Capacitor's Browser plugin ব্যবহার করে রিডাইরেক্ট করুন
        await Browser.open({
          url,
          windowName: "_self"
        });
      }
    });
  };

  return <IonButton onClick={doLogout}>Log out</IonButton>;
};

export default LogoutButton;
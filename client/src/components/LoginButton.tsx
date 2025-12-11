// src/components/LoginButton.tsx
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Browser } from '@capacitor/browser';
import { IonButton } from '@ionic/react';

const LoginButton: React.FC = () => {
  const { loginWithRedirect } = useAuth0();

  const login = async () => {
    await loginWithRedirect({
      async openUrl(url) {
         // Capacitor's Browser plugin ব্যবহার করে রিডাইরেক্ট করুন
        await Browser.open({
          url,
          windowName: "_self"
        });
      }
    });
  };

  return <IonButton onClick={login}>Log in with Google</IonButton>;
};

export default LoginButton;
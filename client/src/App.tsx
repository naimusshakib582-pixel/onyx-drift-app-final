// src/App.tsx
import React, { useEffect } from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { App as CapApp } from '@capacitor/app'; // Capacitor App plugin
import { Browser } from '@capacitor/browser'; // Capacitor Browser plugin

/* অন্যান্য imports... */

setupIonicReact();

const App: React.FC = () => {
  // Auth0 হুক থেকে কলব্যাক হ্যান্ডলার নিন
  const { handleRedirectCallback } = useAuth0();

  // Capacitor ইভেন্ট হ্যান্ডলার
  useEffect(() => {
    CapApp.addListener('appUrlOpen', async ({ url }) => {
      // যদি URL-এ 'state' এবং 'code' বা 'error' থাকে, তবে এটি Auth0 কলব্যাক
      if (url.includes('state') && (url.includes('code') || url.includes('error'))) {
        await handleRedirectCallback(url);
      }
      // iOS/Android সিস্টেম ব্রাউজার বন্ধ করুন
      await Browser.close();
    });
  }, [handleRedirectCallback]); // dependency array তে handleRedirectCallback যোগ করুন

  return (
    <IonApp>
      <IonReactRouter>
        {/* এখানে আপনার রুট কম্পোনেন্টগুলো থাকবে */}
        <IonRouterOutlet>
          {/* উদাহরণ রুট */}
          {/* <Route exact path="/login" component={LoginPage} /> */}
          {/* <Route exact path="/dashboard" component={DashboardPage} /> */}
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
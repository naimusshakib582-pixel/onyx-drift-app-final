// src/pages/Home.tsx

import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonNote } from '@ionic/react';
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react'; // Auth0 এর স্ট্যাটাস চেক করার জন্য

// আপনার তৈরি করা কম্পোনেন্টগুলো আমদানি করুন
import LoginButton from '../components/LoginButton';
import LogoutButton from '../components/LogoutButton';
import Profile from '../components/Profile'; 

const HomePage: React.FC = () => {
  // Auth0 হুক ব্যবহার করে লগইন স্ট্যাটাস নিন
  const { isAuthenticated, isLoading, error } = useAuth0();

  // যদি Auth0 SDK লোড হয়
  if (isLoading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <p>Loading authentication state...</p>
        </IonContent>
      </IonPage>
    );
  }

  // যদি কোনো এরর থাকে
  if (error) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <h1>Authentication Error</h1>
          <p>{error.message}</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>OnyxDrift Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen className="ion-padding">
        
        <IonList lines="full">
          <IonItem>
            <IonLabel>
              <h2>Login Status</h2>
              <p>Current State:</p>
            </IonLabel>
            <IonNote slot="end" color={isAuthenticated ? "success" : "danger"}>
              {isAuthenticated ? 'LOGGED IN' : 'LOGGED OUT'}
            </IonNote>
          </IonItem>
        </IonList>

        <div style={{ marginTop: '20px' }}>
          
          {isAuthenticated ? (
            // যদি লগইন করা থাকে, তবে প্রোফাইল এবং লগআউট বাটন দেখান
            <>
              <h2>User Profile (Logged In)</h2>
              <Profile />
              <LogoutButton />
            </>
          ) : (
            // যদি লগইন করা না থাকে, তবে লগইন বাটন দেখান
            <>
              <h2>Welcome</h2>
              <LoginButton />
            </>
          )}
        </div>
        
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
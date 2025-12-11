// src/components/Profile.tsx
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { IonItem, IonLabel, IonAvatar } from '@ionic/react';

const Profile: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth0();

  // SDK লোড হচ্ছে বা ইউজার লগইন নেই
  if (isLoading || !isAuthenticated) {
    return <p>Please log in.</p>;
  }

  return (
    <IonItem lines="none">
      <IonAvatar slot="start">
        <img src={user.picture} alt={user.name} />
      </IonAvatar>
      <IonLabel>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </IonLabel>
    </IonItem>
  );
};

export default Profile;
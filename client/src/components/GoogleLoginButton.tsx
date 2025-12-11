import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig'; // আপনার কনফিগ ফাইল

const BACKEND_LOGIN_URL = 'http://localhost:5000/api/auth/firebase-login'; // আপনার Express রুট

const GoogleLoginButton: React.FC = () => {
    
    // 1. Google Sign-In প্রক্রিয়া শুরু
    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            // The signed-in user info.
            const user = result.user;
            
            // 2. idToken তৈরি (এটিই আপনার গোপন চাবি)
            const idToken = await user.getIdToken();
            console.log("Firebase ID Token:", idToken);

            // 3. idToken-কে ব্যাকএন্ডে POST রিকোয়েস্টের মাধ্যমে পাঠানো
            await sendTokenToBackend(idToken);
            
            alert('লগইন সফল এবং টোকেন ব্যাকএন্ডে পাঠানো হয়েছে!');
            
        } catch (error: any) {
            // Handle Errors here.
            console.error("Login Error:", error.code, error.message);
            alert(`লগইন ব্যর্থ হয়েছে: ${error.message}`);
        }
    };

    // idToken-কে Express সার্ভারে পাঠানোর ফাংশন
    const sendTokenToBackend = async (token: string) => {
        try {
            const response = await fetch(BACKEND_LOGIN_URL, {
                method: 'POST',
                headers: {
                    // idToken সাধারণত Authorization header-এ Bearer Scheme-এর মাধ্যমে পাঠানো হয়
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                // আপনি চাইলে JSON বডিতেও টোকেন পাঠাতে পারেন, তবে Authorization Header সেরা
                // body: JSON.stringify({ idToken: token }) 
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ব্যাকএন্ডে টোকেন যাচাইয়ে সমস্যা হয়েছে।');
            }

            const data = await response.json();
            console.log("ব্যাকএন্ড থেকে সাড়া:", data);
            
            // এইখানে আপনি ব্যাকএন্ড থেকে পাওয়া ইউজার ডাটা (যেমন: সেশন কুকি, ইউজার অবজেক্ট) সংরক্ষণ করতে পারেন।

        } catch (error) {
            console.error("ব্যাকএন্ডে পাঠানোর সমস্যা:", error);
            throw error; // যাতে মূল handleGoogleLogin ফাংশন এটিকে ধরে ফেলতে পারে
        }
    };

    return (
        <button 
            onClick={handleGoogleLogin} 
            style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
            🚀 Login with Google (Frontend Test)
        </button>
    );
};

export default GoogleLoginButton;
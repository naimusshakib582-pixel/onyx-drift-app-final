import React, { useState } from 'react';

// ⚠️ আপনার ব্যাকএন্ড API এর সঠিক HTTP URL ব্যবহার করুন
const RENDER_HTTP_URL = "https://onyx-drift-app-final.onrender.com"; 

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false); // লগইন স্ট্যাটাস

    // 💡 মূল ফাংশন: ফর্ম সাবমিট হলে এই ফাংশনটি কল হবে
    const handleLogin = async (e) => {
        // 🛑 সবথেকে গুরুত্বপূর্ণ: এটি ব্রাউজারের ডিফল্ট রিফ্রেশ হওয়া বন্ধ করে
        e.preventDefault(); 

        setError(''); // পূর্বের ত্রুটি মুছে ফেলুন

        if (!email || !password) {
            setError('অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড দিন।');
            return;
        }

        try {
            // API কল: লগইন তথ্য ব্যাকএন্ডে পাঠানো
            const response = await fetch(`${RENDER_HTTP_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                // যদি সার্ভার 400 বা 500 রেসপন্স দেয়
                const errorData = await response.json();
                setError(errorData.message || 'লগইন ব্যর্থ হয়েছে। ইমেইল বা পাসওয়ার্ড ভুল।');
                return;
            }

            // লগইন সফল হলে
            const data = await response.json();
            console.log("Login successful:", data);
            
            // 🚨 এখানে আপনার অ্যাপ্লিকেশনের পরবর্তী স্টেপ যোগ করুন (যেমন: টোকেন সেভ করা, ফিড পেজে রিডাইরেক্ট করা)
            setIsLoggedIn(true);
            // window.location.href = '/feed'; 

        } catch (err) {
            console.error("Network or server error:", err);
            setError('সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।');
        }
    };

    if (isLoggedIn) {
        return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>লগইন সফল! 🎉</h2>;
    }

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2 style={{ textAlign: 'center' }}>লগইন</h2>
            {/* 💡 ফর্ম ট্যাগ ব্যবহার করা হয়েছে এবং onSubmit সেট করা হয়েছে */}
            <form onSubmit={handleLogin}> 
                
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>ইমেইল</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="আপনার ইমেইল আইডি"
                        required
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>পাসওয়ার্ড</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="আপনার পাসওয়ার্ড"
                        required
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
                
                {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}

                {/* 💡 type="submit" নিশ্চিত করে এন্টার বাটন কাজ করবে */}
                <button 
                    type="submit" 
                    style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    লগইন করুন
                </button>
            </form>
        </div>
    );
}
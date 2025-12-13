// C:\Development\onyx-drift-app-final\client\AuthMiddleware\auth.js

import * as admin from 'firebase-admin';
// ✅ সংশোধন: এক ধাপ উপরে (client) এসে models/User.js এ প্রবেশ
import User from '../data_models/user.js';

export const verifyAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required.' });
    }
    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const user = await User.findOne({ firebaseId: decodedToken.uid });

        if (!user) {
            return res.status(404).json({ message: 'User profile not found.' });
        }

        req.user = { 
            id: user._id.toString(),
            firebaseId: decodedToken.uid,
        };
        next();
    } catch (error) {
        console.error("Token verification failed:", error.message);
        return res.status(401).json({ message: 'Authentication failed: Invalid or expired token.' });
    }
};
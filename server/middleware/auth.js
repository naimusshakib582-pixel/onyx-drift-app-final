import { auth } from 'express-oauth2-jwt-bearer';

/**
 * Auth0 JWT Validation Configuration
 * এটি ফ্রন্টএন্ড থেকে আসা Bearer Token-টি RS256 অ্যালগরিদমে ভেরিফাই করে।
 */
const checkJwt = auth({
  audience: 'https://onyx-drift-api.com', // আপনার Auth0 API Identifier
  issuerBaseURL: 'https://dev-6d0nxccsaycctfl1.us.auth0.com/', // আপনার Auth0 Domain (শেষে স্ল্যাশ নিশ্চিত করুন)
  tokenSigningAlg: 'RS256'
});

/**
 * Custom Auth Middleware
 * টোকেন ভেরিফাই করার পর এটি Auth0 এর 'sub' (User ID) কে 
 * এক্সপ্রেসের ডিফল্ট req.user অবজেক্টে সেট করে দেয়।
 */
const authMiddleware = (req, res, next) => {
  checkJwt(req, res, (err) => {
    if (err) {
      console.error("❌ Auth0 Middleware Error:", err.message);
      
      // আরও ডিটেইলড এরর মেসেজ রেন্ডার লগের জন্য
      return res.status(401).json({ 
        msg: 'Unauthorized: Access Denied', 
        error: err.message,
        hint: "Make sure you are sending the token in the 'Authorization: Bearer <token>' header."
      });
    }
    
    // টোকেন ভ্যালিড হলে ডাটাবেস অপারেশনের জন্য ইউজার আইডি সেট করা
    if (req.auth && req.auth.payload) {
      req.user = {
        id: req.auth.payload.sub // এটি Auth0 থেকে আসা ইউনিক ইউজার আইডি
      };
      next();
    } else {
      return res.status(401).json({ msg: 'Token payload missing' });
    }
  });
};

export default authMiddleware;
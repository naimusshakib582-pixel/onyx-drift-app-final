import { auth } from 'express-oauth2-jwt-bearer';

/**
 * Auth0 JWT Validation Configuration
 */
const checkJwt = auth({
  audience: 'https://onyx-drift-api.com', 
  issuerBaseURL: 'https://dev-6d0nxccsaycctfl1.us.auth0.com/', 
  tokenSigningAlg: 'RS256'
});

/**
 * 🚀 Smart Auth Middleware (Viral-Ready)
 * এটি টোকেন থাকলে ভেরিফাই করবে, আর না থাকলে 'Guest' হিসেবে গণ্য করবে।
 * এতে আপনার অ্যাপের "Low Friction" ভিশন সফল হবে।
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ১. যদি টোকেন একেবারেই না থাকে (লগইন ছাড়া ইউজার)
  if (!authHeader) {
    req.user = { isGuest: true, id: null };
    return next(); // ভাইরাল ফিড দেখার জন্য গেস্টকে অ্যালাউ করছি
  }

  // ২. যদি টোকেন থাকে, তবে ভেরিফাই করো
  checkJwt(req, res, (err) => {
    if (err) {
      // যদি টোকেন ভুল বা এক্সপায়ারড হয়, তবে গেস্ট হিসেবে ট্রিট করো অথবা এরর দাও
      console.warn("⚠️ Token Invalid, treating as guest:", err.message);
      req.user = { isGuest: true, id: null };
      return next();
    }
    
    // ৩. টোকেন ভ্যালিড হলে ইউজার আইডি সেট করো
    if (req.auth && req.auth.payload) {
      req.user = {
        id: req.auth.payload.sub,
        sub: req.auth.payload.sub,
        isGuest: false // রেজিস্টার্ড ইউজার
      };
      next();
    } else {
      req.user = { isGuest: true, id: null };
      next();
    }
  });
};

export default authMiddleware;
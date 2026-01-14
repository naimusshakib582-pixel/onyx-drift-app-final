import { auth } from 'express-oauth2-jwt-bearer';

/**
 * Auth0 JWT Validation Configuration
 */
const checkJwt = auth({
  // অডিয়েন্স ইউআরএলটি এখন সঠিকভাবে কোটেশনের ভেতরে রাখা হয়েছে
  audience: 'https://onyx-drift-api.com', 
  issuerBaseURL: 'https://dev-6d0nxccsaycctfl1.us.auth0.com/', 
  tokenSigningAlg: 'RS256'
});

/**
 * 🚀 Smart Auth Middleware
 * টোকেন থাকলে ভেরিফাই করবে, না থাকলে গেস্ট হিসেবে অ্যালাউ করবে।
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ১. যদি টোকেন একেবারেই না থাকে (লগইন ছাড়া ইউজার/গেস্ট)
  if (!authHeader) {
    req.user = { isGuest: true, id: null };
    return next();
  }

  // ২. টোকেন থাকলে ভেরিফাই করো
  checkJwt(req, res, (err) => {
    if (err) {
      // টোকেন ইনভ্যালিড বা এক্সপায়ার্ড হলে এখানে ধরা পড়বে
      console.warn("⚠️ Token Invalid:", err.message);
      
      // গুরুত্বপূর্ণ: পোস্ট করার সময় যদি টোকেন ভুল থাকে তবে অবশ্যই ৪০১ এরর দিতে হবে
      if (req.method === "POST") {
         return res.status(401).json({ 
           msg: "Session expired or invalid token. Please login again." 
         });
      }
      
      // অন্য সাধারণ রিকোয়েস্টের (যেমন GET) জন্য গেস্ট হিসেবে চলতে দাও
      req.user = { isGuest: true, id: null };
      return next();
    }
    
    // ৩. টোকেন ভ্যালিড হলে ইউজার ডাটা সেট করো
    if (req.auth && req.auth.payload) {
      req.user = {
        id: req.auth.payload.sub,
        sub: req.auth.payload.sub,
        isGuest: false
      };
      next();
    } else {
      req.user = { isGuest: true, id: null };
      next();
    }
  });
};

export default authMiddleware;
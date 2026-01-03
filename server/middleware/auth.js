import { auth } from 'express-oauth2-jwt-bearer';

// Auth0 টোকেন ভ্যালিডেশন মিডলওয়্যার
const checkJwt = auth({
  // এটি আপনার Auth0 ড্যাশবোর্ডের API Identifier (https://onyx-drift-api.com)
  audience: 'https://onyx-drift-api.com', 
  // এটি আপনার Auth0 Domain (https://[your-domain].auth0.com/)
  issuerBaseURL: `https://dev-6d0nxccsaycctfl1.us.auth0.com/`, 
  tokenSigningAlg: 'RS256'
});

// কাস্টম মিডলওয়্যার যাতে রিকোয়েস্ট অবজেক্টে ইউজার আইডি সেট করা যায়
const authMiddleware = (req, res, next) => {
  checkJwt(req, res, (err) => {
    if (err) {
      console.error("Auth Error:", err.message);
      return res.status(401).json({ msg: 'Token is not valid or missing', error: err.message });
    }
    
    // Auth0 টোকেন থেকে ইউজার আইডি (sub) নিয়ে req.user এ সেট করা
    // এটি করলে আপনার আগের router.post('/api/posts') এর req.user.id কোড কাজ করবে
    if (req.auth) {
      req.user = {
        id: req.auth.payload.sub
      };
    }
    next();
  });
};

export default authMiddleware;
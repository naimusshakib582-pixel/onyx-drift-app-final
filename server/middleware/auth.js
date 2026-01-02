import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  // হেডার থেকে টোকেন নেওয়া
  const token = req.header('x-auth-token');

  // টোকেন না থাকলে
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // টোকেন ভেরিফাই করা
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecrettoken');
    
    // রিকোয়েস্ট অবজেক্টে ইউজার ডাটা সেট করা
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

export default auth;
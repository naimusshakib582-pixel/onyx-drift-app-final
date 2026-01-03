import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import multer from 'multer';

const router = express.Router();
const upload = multer(); // শুধু ডাটা রিসিভ করার জন্য (ইমেজ ছাড়া)

// --- প্রোফাইল ডাটা গেট করা (Fixes the 404 Fetch Error) ---
// ফ্রন্টএন্ড রিকোয়েস্ট দিচ্ছে /api/user/profile/:id 
router.get('/profile/:id', auth, async (req, res) => {
  try {
    // Auth0 sub আইডি (google-oauth2|...) দিয়ে ডাটাবেসে খোঁজা
    const user = await User.findOne({ auth0Id: req.params.id });
    
    if (!user) {
      return res.status(404).json({ msg: 'Identity not found in neural database' });
    }
    res.json(user);
  } catch (err) {
    console.error('Fetch Error:', err.message);
    res.status(500).send('Server error');
  }
});

// --- প্রোফাইল আপডেট করা ---
router.put("/update-profile", auth, async (req, res) => {
  try {
    const { nickname, bio, location, workplace } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { auth0Id: req.user.id }, 
      { 
        $set: { 
          name: nickname, 
          bio, 
          location, 
          workplace 
        } 
      },
      { new: true, upsert: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ msg: 'Update Failed', error: err.message });
  }
});

export default router;
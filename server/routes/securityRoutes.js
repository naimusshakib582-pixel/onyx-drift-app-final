import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// ১. Ghost Mode টগল করা
router.put('/toggle-ghost', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.ghostMode = !user.ghostMode;
    await user.save();
    res.json({ msg: `Ghost Mode ${user.ghostMode ? 'Activated' : 'Deactivated'}`, ghostMode: user.ghostMode });
  } catch (err) {
    res.status(500).send('Neural Server Error');
  }
});

// ২. Anti-Screenshot প্রোটেকশন আপডেট
router.put('/anti-screenshot', auth, async (req, res) => {
  try {
    const { status } = req.body;
    await User.findByIdAndUpdate(req.user.id, { antiScreenshot: status });
    res.json({ msg: "Privacy Layer Updated" });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// ৩. একটিভ সেশন দেখা (Active Nodes)
router.get('/active-nodes', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('activeNodes');
    res.json(user.activeNodes);
  } catch (err) {
    res.status(500).send('Error fetching nodes');
  }
});

export default router;
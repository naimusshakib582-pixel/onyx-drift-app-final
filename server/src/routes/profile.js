import express from "express";

const router = express.Router();

// GET profile
router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  res.json({
    userId,
    name: "Naimus Shakib",
    email: "naimusshakib582@gmail.com",
    avatar: "https://via.placeholder.com/150",
  });
});

// PUT profile
router.put("/:userId", (req, res) => {
  const { userId } = req.params;
  const { name, avatar } = req.body;
  res.json({
    userId,
    name,
    avatar,
    message: "Profile updated successfully",
  });
});

export default router;

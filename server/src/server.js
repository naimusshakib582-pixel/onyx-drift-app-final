require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 10000;

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Middlewares
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("✅ OnyxDrift API is running");
});

// Get Profile
app.get("/api/profile/:auth0Id", async (req, res) => {
  const { auth0Id } = req.params;
  try {
    let user = await User.findOne({ auth0Id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update Profile
app.put("/api/profile/:auth0Id", async (req, res) => {
  const { auth0Id } = req.params;
  const { name, avatar } = req.body;
  try {
    let user = await User.findOneAndUpdate(
      { auth0Id },
      { name, avatar },
      { new: true, upsert: true } // upsert:true creates new if not exists
    );
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

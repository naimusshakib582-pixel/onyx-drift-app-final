import express from "express";
import cors from "cors";

const app = express();

// CORS middleware
app.use(cors());

// JSON middleware (important for POST requests)
app.use(express.json());

// Example login route
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  // Dummy check
  if (email === "test@example.com" && password === "123456") {
    res.json({ success: true, message: "Login successful" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Server listen
app.listen(5000, () => console.log("Server running on port 5000"));

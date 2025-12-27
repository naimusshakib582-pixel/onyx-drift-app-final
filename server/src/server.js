import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import profileRoutes from "./routes/profile.js"; // নিশ্চিত যে path ঠিক

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// ✅ Mount profile routes
app.use("/api/profile", profileRoutes);

// Test route
app.get("/", (req, res) => res.send("API running"));

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

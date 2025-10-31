import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import connectDB from './config/db.js'; // ES Module compatible

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import uploadRoutes from './routes/upload.js';

// __dirname for ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// Check env
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI missing in .env');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET not set in .env');
}

// Connect to MongoDB
connectDB(process.env.MONGO_URI).catch(err => {
  console.error('Failed to connect DB:', err);
  process.exit(1);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/upload', uploadRoutes);

// Serve client build
app.use(express.static(path.join(__dirname, "../client/build")));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// Simple API check
app.get('/', (req, res) => res.send('API running'));

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ msg: 'Server error', error: err.message }); // <<-- 💡 এইখানে পরিবর্তন করা হয়েছে (err.message যোগ করা হয়েছে)
}); // <<-- 💡 এই বন্ধনীটি (`}`) মিসিং ছিল

// Start Server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`)); // <<-- 💡 এই অংশটি (সার্ভার শুরু করার কোড) সম্পূর্ণ মিসিং ছিল, তাই এটি যোগ করা হলো।
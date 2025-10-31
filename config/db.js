// server/config/db.js
const mongoose = require('mongoose');

const connectDB = async (mongoUri, maxRetries = 5, retryDelay = 3000) => {
  let attempts = 0;
  if (!mongoUri) {
    console.error('connectDB: no mongoUri provided');
    process.exit(1);
  }
  const tryConnect = async () => {
    try {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected');
    } catch (err) {
      attempts++;
      console.error(`MongoDB connection error (attempt ${attempts}):`, err.message);
      if (attempts >= maxRetries) {
        console.error('Max retries reached. Exiting.');
        process.exit(1);
      }
      console.log(`Retrying in ${retryDelay}ms...`);
      await new Promise(r => setTimeout(r, retryDelay));
      return tryConnect();
    }
  };
  return tryConnect();
};

module.exports = connectDB;

// config/db.js এর ভেতরটা সম্ভবত এরকম হওয়া উচিত:
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // এখানে নামের বানান চেক করুন (MONGODB_URI কি না)
    const conn = await mongoose.connect(process.env.MONGODB_URI); 
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
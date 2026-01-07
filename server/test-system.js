import Redis from "ioredis";
import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function runDiagnostics() {
    console.log("🔍 OnyxDrift Neural Diagnostics Starting...\n");

    // ১. Redis Cloud Check
    try {
        const redis = new Redis("redis://default:vrf4EFLABBRLQ65e02TISHLbzC3kGiCH@redis-16125.c10.us-east-1-4.ec2.cloud.redislabs.com:16125");
        await redis.set("health_check", "OK");
        const status = await redis.get("health_check");
        console.log(`✅ Redis Cloud: Connected (${status})`);
        await redis.quit();
    } catch (err) {
        console.log("❌ Redis Cloud: Connection Failed!");
    }

    // ২. MongoDB Check
    // test-system.js এর ভেতর MongoDB চেক অংশটি এভাবে পরিবর্তন করুন
try {
    // আপনার .env থেকে MONGO_URL সরাসরি এখানে দিন অথবা নিচের ইউআরএলটি চেক করুন
    const mongoURI = "mongodb+srv://naimusshakib69:5K8B4Uu39O364k0t@cluster0.4buy0id.mongodb.net/onyx_drift";
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Atlas: Connected");
    await mongoose.disconnect();
} catch (err) {
    console.log("❌ MongoDB Atlas: Connection Failed! Error: " + err.message);
}    // ৩. Server API Check
    try {
        const res = await axios.get("http://localhost:10000/");
        console.log(`✅ Backend Server: Online (${res.data})`);
    } catch (err) {
        console.log("❌ Backend Server: Not Responding! (Make sure 'node index.js' is running)");
    }

    console.log("\n🚀 Diagnostics Complete!");
}

runDiagnostics();
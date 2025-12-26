import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  userId: String,
  name: String,
  avatar: String,
});

export default mongoose.model("Profile", ProfileSchema);

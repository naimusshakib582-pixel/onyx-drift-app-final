import mongoose from "mongoose";

const StorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  mediaUrl: { type: String, required: true },
  text: { type: String },
  musicName: { type: String },
  musicUrl: { type: String },
  filter: { type: String },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: { expires: '12h' } 
  }
});

// module.exports এর বদলে এটি ব্যবহার করুন
export default mongoose.model("Story", StorySchema);
const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String },
  userImage: { type: String },
  mediaUrl: { type: String, required: true },
  text: { type: String },
  musicName: { type: String },
  musicUrl: { type: String },
  filter: { type: String },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: { expires: '12h' } // এটি ১২ ঘণ্টা পর অটোমেটিক ডিলিট করে দেবে
  }
});

module.exports = mongoose.model("Story", StorySchema);
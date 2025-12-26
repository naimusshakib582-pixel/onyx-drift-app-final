const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String, default: "https://via.placeholder.com/150" },
});

module.exports = mongoose.model("User", userSchema);

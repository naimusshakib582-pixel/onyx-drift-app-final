import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true }, // URL এর জন্য (যেমন: onyx-drift.com/node/tech)
  description: { type: String, maxlength: 300 },
  avatar: { type: String, default: "" },
  banner: { type: String, default: "" },
  creator: { type: String, required: true }, // Auth0 ID
  moderators: [{ type: String }],
  members: [{ type: String, index: true }],
  privacy: { type: String, enum: ['public', 'private'], default: 'public' },
  category: { type: String, default: 'General' }
}, { timestamps: true });

communitySchema.index({ name: 'text', description: 'text' });

const Community = mongoose.model("Community", communitySchema);
export default Community;
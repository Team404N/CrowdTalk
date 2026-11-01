// Community model. `invites` holds users invited to a private community.
const mongoose = require('mongoose');
const { Schema } = mongoose;

const communitySchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, default: 'General' },
  type: { type: String, enum: ['public', 'private'], default: 'public' },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  invites: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  postsCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Community', communitySchema);

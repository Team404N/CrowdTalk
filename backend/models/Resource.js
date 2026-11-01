// Shared link / document / guide inside a community.
const mongoose = require('mongoose');
const { Schema } = mongoose;

const resourceSchema = new Schema({
  title: { type: String, required: true, trim: true },
  link: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  category: { type: String, default: 'Article', trim: true },
  community: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
  sharedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);

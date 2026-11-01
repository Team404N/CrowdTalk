// Comment on a post. Optional `parent` enables nested replies.
const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
  content: { type: String, required: true, trim: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
}, { timestamps: true }); // createdAt is added automatically

module.exports = mongoose.model('Comment', commentSchema);

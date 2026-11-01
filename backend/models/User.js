// User model: profile, role, joined communities, notification preferences and OTP fields.
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 300 },
  profession: { type: String, default: '' },
  interests: [{ type: String }],
  joinedCommunities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
  notificationSettings: {
    discussions: { type: Boolean, default: true },
    resources: { type: Boolean, default: true },
    invites: { type: Boolean, default: true },
  },
  isVerified: { type: Boolean, default: false },
  otp: { type: String, select: false },
  otpExpires: { type: Date, select: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

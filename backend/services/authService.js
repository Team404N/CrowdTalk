// JWT signing, password hashing and OTP generation.
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

exports.signToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
exports.hashPassword = (plain) => bcrypt.hash(plain, 10);
exports.comparePassword = (plain, hash) => bcrypt.compare(plain, hash);
exports.generateOTP = () => String(crypto.randomInt(100000, 1000000)); // 6 digits
exports.OTP_TTL_MS = 10 * 60 * 1000; // OTP valid for 10 minutes

// Standard login/verify response: { token, user }
exports.authResponse = (user) => ({
  token: exports.signToken(user),
  user: { id: String(user._id), name: user.name, username: user.username, email: user.email, role: user.role, avatar: require('../utils/helpers').userOut(user).avatar, bio: user.bio },
});

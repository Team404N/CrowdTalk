// Auth: register, login, sendOTP, verifyOTP, resetPassword
const User = require('../models/User');
const { hashPassword, comparePassword, generateOTP, OTP_TTL_MS, authResponse } = require('../services/authService');
const { sendOTPEmail } = require('../services/emailService');
const { ok, httpError, asyncHandler } = require('../utils/helpers');

const isDev = () => process.env.NODE_ENV !== 'production';

// Saves a fresh OTP on the user and "emails" it
const issueOTP = async (user) => {
  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
  await user.save();
  await sendOTPEmail(user.email, otp);
  return otp;
};

// POST /api/auth/register (alias: /signup)
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, username } = req.body;
  const cleanEmail = email.toLowerCase().trim();
  if (await User.findOne({ email: cleanEmail })) throw httpError(400, 'User with this email already exists');

  // username: use the one provided, otherwise derive from email; make sure it is unique
  let uname = (username || cleanEmail.split('@')[0]).toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user';
  if (username && await User.findOne({ username: uname })) throw httpError(400, 'Username is already taken');
  while (await User.findOne({ username: uname })) uname += Math.floor(Math.random() * 10);

  const user = new User({ name, email: cleanEmail, username: uname, password: await hashPassword(password) });
  const otp = await issueOTP(user);
  ok(res, { message: 'Account created. We sent a 6-digit OTP to your email.', email: cleanEmail, ...(isDev() && { devOtp: otp }) }, 201);
});

// POST /api/auth/login  ->  { token, user: { id, name, email, role, avatar } }
exports.login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase().trim() }).select('+password');
  if (!user || !(await comparePassword(req.body.password, user.password))) throw httpError(401, 'Invalid email or password');
  if (!user.isVerified) throw httpError(403, 'Please verify your email with the OTP first');
  ok(res, authResponse(user));
});

// POST /api/auth/send-otp (alias: /resend-otp). Same reply whether or not the email exists.
exports.sendOTP = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase().trim() });
  let otp;
  if (user) otp = await issueOTP(user);
  ok(res, { message: 'If that email is registered, an OTP has been sent.', ...(isDev() && otp && { devOtp: otp }) });
});

// Checks the OTP stored on a user; throws if wrong or expired
const checkOTP = async (email, otp) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+otp +otpExpires');
  if (!user || !user.otp || user.otp !== String(otp) || user.otpExpires < new Date()) throw httpError(400, 'Invalid or expired OTP');
  return user;
};

// POST /api/auth/verify-otp -> marks email verified and logs the user in
exports.verifyOTP = asyncHandler(async (req, res) => {
  const user = await checkOTP(req.body.email, req.body.otp);
  user.isVerified = true; user.otp = undefined; user.otpExpires = undefined;
  await user.save();
  ok(res, authResponse(user));
});

// POST /api/auth/reset-password { email, otp, newPassword }
exports.resetPassword = asyncHandler(async (req, res) => {
  const user = await checkOTP(req.body.email, req.body.otp);
  user.password = await hashPassword(req.body.newPassword);
  user.isVerified = true; user.otp = undefined; user.otpExpires = undefined;
  await user.save();
  ok(res, { message: 'Password updated. You can log in now.' });
});

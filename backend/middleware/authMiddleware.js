// Protects routes: reads "Authorization: Bearer <token>", verifies it and sets req.user.
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { httpError, asyncHandler } = require('../utils/helpers');

exports.protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw httpError(401, 'Not authorized: token missing');
  let decoded;
  try { decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET); }
  catch { throw httpError(401, 'Not authorized: token invalid or expired'); }
  const user = await User.findById(decoded.id);
  if (!user) throw httpError(401, 'Not authorized: user no longer exists');
  req.user = user;
  next();
});

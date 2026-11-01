// Use AFTER `protect`. Allows only users whose role is 'admin'.
const { httpError } = require('../utils/helpers');

exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return next(httpError(403, 'Admin access required'));
  next();
};

// Input validation + Multer (profile picture upload, max 2MB).
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { httpError } = require('../utils/helpers');

// ---- Body validation: validateBody({ field: { label, email, min, url, alias } }) ----
exports.validateBody = (rules) => (req, res, next) => {
  for (const [field, r] of Object.entries(rules)) {
    const value = req.body[field] ?? (r.alias ? req.body[r.alias] : undefined);
    const label = r.label || field;
    if (value === undefined || value === null || String(value).trim() === '') return next(httpError(400, `${label} is required`));
    if (r.email && !/^\S+@\S+\.\S+$/.test(value)) return next(httpError(400, 'Enter a valid email address'));
    if (r.min && String(value).length < r.min) return next(httpError(400, `${label} must be at least ${r.min} characters`));
    if (r.url) { try { new URL(value); } catch { return next(httpError(400, 'Enter a valid URL (include https://)')); } }
  }
  next();
};

// ---- Multer config for avatars ----
const dir = path.join(__dirname, '..', 'uploads', 'profile-pictures');
fs.mkdirSync(dir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: dir,
    filename: (req, file, cb) => cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => (file.mimetype.startsWith('image/') ? cb(null, true) : cb(httpError(400, 'Only image files are allowed'))),
}).single('avatar');

// Wrapper so Multer errors become our standard 400 JSON error
exports.uploadAvatar = (req, res, next) => {
  upload(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') return next(httpError(400, 'Image must be 2MB or smaller'));
    next(err.status ? err : httpError(400, err.message));
  });
};

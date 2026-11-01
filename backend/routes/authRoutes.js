// /api/auth/*  (public)
const router = require('express').Router();
const c = require('../controllers/authController');
const { validateBody } = require('../middleware/validationMiddleware');

const registerRules = { name: { label: 'Name' }, email: { label: 'Email', email: true }, password: { label: 'Password', min: 8 } };

router.post(['/register', '/signup'], validateBody(registerRules), c.register);
router.post('/login', validateBody({ email: { email: true, label: 'Email' }, password: { label: 'Password' } }), c.login);
router.post(['/send-otp', '/resend-otp'], validateBody({ email: { email: true, label: 'Email' } }), c.sendOTP);
router.post('/verify-otp', validateBody({ email: { email: true, label: 'Email' }, otp: { label: 'OTP' } }), c.verifyOTP);
router.post('/reset-password', validateBody({ email: { email: true, label: 'Email' }, otp: { label: 'OTP' }, newPassword: { label: 'New password', min: 8 } }), c.resetPassword);

module.exports = router;

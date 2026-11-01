// /api/users/*  (specific paths BEFORE '/:id')
const router = require('express').Router();
const c = require('../controllers/userController');
const { updateNotificationSettings } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { uploadAvatar } = require('../middleware/validationMiddleware');

router.use(protect);
router.get('/me', c.getProfile);
router.put('/me', c.updateProfile);
router.get('/me/activity', c.getUserActivity);
router.post('/avatar', uploadAvatar, c.uploadAvatar);
router.post('/onboarding', c.saveOnboarding);
router.put('/settings', updateNotificationSettings);

// Admin
router.get('/', adminOnly, c.listUsers);
router.put('/:id', adminOnly, c.adminUpdateUser);
router.delete('/:id', adminOnly, c.deleteUser);
router.get('/:id', c.getProfile);

module.exports = router;

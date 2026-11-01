// /api/notifications/*  ('read-all' and 'settings' before '/:id/read')
const router = require('express').Router();
const c = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', c.getUserNotifications);
router.put('/read-all', c.markAllAsRead);
router.put('/settings', c.updateNotificationSettings);
router.put('/:id/read', c.markAsRead);

module.exports = router;

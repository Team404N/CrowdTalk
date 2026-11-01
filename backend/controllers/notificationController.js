// Notifications: list, mark as read, preferences
const Notification = require('../models/Notification');
const { ok, httpError, asyncHandler, idOf, timeAgo } = require('../utils/helpers');

const textFor = (n) => {
  const who = n.sender?.username ? `@${n.sender.username}` : 'Someone';
  const where = n.community?.name || 'a community';
  if (n.type === 'discussion') return `${who} started a discussion in ${where}`;
  if (n.type === 'resource') return `${who} shared a resource in ${where}`;
  return `${who} invited you to join ${where}`;
};

// GET /api/notifications
exports.getUserNotifications = asyncHandler(async (req, res) => {
  const list = await Notification.find({ recipient: req.user._id }).sort('-createdAt').limit(50)
    .populate('sender', 'username').populate('community', 'name');
  const joined = req.user.joinedCommunities.map(String);
  const visible = list.filter((n) => n.community && (n.type === 'invite' || joined.includes(idOf(n.community)))); // hide communities the user left
  ok(res, visible.map((n) => ({ id: idOf(n), type: n.type, text: textFor(n), time: timeAgo(n.createdAt), read: n.read, communityId: idOf(n.community) })));
});

// PUT /api/notifications/:id/read
exports.markAsRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { read: true }, { new: true });
  if (!n) throw httpError(404, 'Notification not found');
  ok(res, { id: idOf(n), read: true });
});

// PUT /api/notifications/read-all
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
  ok(res, { message: 'All notifications marked as read' });
});

// PUT /api/notifications/settings (also /api/users/settings)  { discussions, resources, invites }
// Security alerts are always on, so they are not part of these settings.
exports.updateNotificationSettings = asyncHandler(async (req, res) => {
  ['discussions', 'resources', 'invites'].forEach((k) => {
    if (typeof req.body[k] === 'boolean') req.user.notificationSettings[k] = req.body[k];
  });
  await req.user.save();
  ok(res, req.user.notificationSettings);
});

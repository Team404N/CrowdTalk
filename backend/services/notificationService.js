// Creates notification documents when something happens in a community.
const Notification = require('../models/Notification');
const Community = require('../models/Community');
const User = require('../models/User');

// Notify every CURRENT member (except the sender) who has this notification type enabled.
// Users who left the community are not in `members`, so they are excluded automatically.
exports.notifyMembers = async ({ community, sender, type }) => {
  const fresh = await Community.findById(community).select('members');
  if (!fresh) return;
  const ids = fresh.members.filter((m) => String(m) !== String(sender));
  const users = await User.find({ _id: { $in: ids } }).select('notificationSettings');
  const docs = users
    .filter((u) => u.notificationSettings?.[`${type}s`] !== false)
    .map((u) => ({ recipient: u._id, sender, type, community }));
  if (docs.length) await Notification.insertMany(docs);
};

// Notify a single user (used for invites)
exports.notifyUser = async ({ recipient, sender, type, community }) => {
  const user = await User.findById(recipient).select('notificationSettings');
  if (user && user.notificationSettings?.[`${type}s`] !== false) {
    await Notification.create({ recipient, sender, type, community });
  }
};

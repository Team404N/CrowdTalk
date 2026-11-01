// Users: profile, avatar, activity, onboarding + admin user management
const User = require('../models/User');
const Community = require('../models/Community');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');
const { ok, httpError, asyncHandler, userOut } = require('../utils/helpers');

// GET /api/users/me  or  /api/users/:id
exports.getProfile = asyncHandler(async (req, res) => {
  const isSelf = !req.params.id || req.params.id === String(req.user._id);
  const user = isSelf ? req.user : await User.findById(req.params.id);
  if (!user) throw httpError(404, 'User not found');
  const [posts, resources] = await Promise.all([Post.countDocuments({ author: user._id }), Resource.countDocuments({ sharedBy: user._id })]);
  ok(res, { ...userOut(user, { withEmail: isSelf || req.user.role === 'admin' }), stats: { posts, communities: user.joinedCommunities.length, resources } });
});

// PUT /api/users/me  -> only name and bio (and optional profession/interests). Email can NEVER change.
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, profession, interests, email } = req.body;
  if (email && email.toLowerCase() !== req.user.email) throw httpError(400, 'Email address cannot be changed');
  if (name !== undefined) {
    if (!String(name).trim()) throw httpError(400, 'Name is required');
    req.user.name = name.trim();
  }
  if (bio !== undefined) req.user.bio = bio;
  if (profession !== undefined) req.user.profession = profession;
  if (Array.isArray(interests)) req.user.interests = interests;
  await req.user.save();
  ok(res, userOut(req.user));
});

// POST /api/users/avatar (multipart, field "avatar", max 2MB - enforced by Multer middleware)
exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw httpError(400, 'Please choose an image to upload');
  req.user.avatar = `/uploads/profile-pictures/${req.file.filename}`;
  await req.user.save();
  ok(res, userOut(req.user));
});

// GET /api/users/me/activity
exports.getUserActivity = asyncHandler(async (req, res) => {
  const [posts, comments, resources] = await Promise.all([
    Post.find({ author: req.user._id }).sort('-createdAt').limit(20).select('title createdAt community'),
    Comment.countDocuments({ author: req.user._id }),
    Resource.find({ sharedBy: req.user._id }).sort('-createdAt').limit(20).select('title link createdAt'),
  ]);
  ok(res, { posts, commentsCount: comments, resources, communitiesCount: req.user.joinedCommunities.length });
});

// POST /api/users/onboarding  { name, bio, profession, interests, communities: [ids] }
exports.saveOnboarding = asyncHandler(async (req, res) => {
  const { name, bio, profession, interests, communities } = req.body;
  if (name && name.trim()) req.user.name = name.trim();
  if (bio !== undefined) req.user.bio = bio;
  if (profession !== undefined) req.user.profession = profession;
  if (Array.isArray(interests)) req.user.interests = interests;
  if (Array.isArray(communities) && communities.length) {
    // Only public communities can be joined without an invite
    const joinable = await Community.find({ _id: { $in: communities }, type: 'public' }).select('_id');
    for (const c of joinable) {
      await Community.updateOne({ _id: c._id }, { $addToSet: { members: req.user._id } });
      if (!req.user.joinedCommunities.some((id) => id.equals(c._id))) req.user.joinedCommunities.push(c._id);
    }
  }
  await req.user.save();
  ok(res, userOut(req.user));
});

// ---------- ADMIN ----------
// GET /api/users  (admin) -> all users
exports.listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt');
  ok(res, users.map((u) => userOut(u)));
});

// PUT /api/users/:id  (admin) -> may change name/bio/role, but NEVER the email
exports.adminUpdateUser = asyncHandler(async (req, res) => {
  if (req.body.email !== undefined) throw httpError(400, "Admin cannot change a user's email address");
  const user = await User.findById(req.params.id);
  if (!user) throw httpError(404, 'User not found');
  ['name', 'bio'].forEach((f) => { if (req.body[f] !== undefined) user[f] = req.body[f]; });
  if (['user', 'admin'].includes(req.body.role)) user.role = req.body.role;
  await user.save();
  ok(res, userOut(user));
});

// DELETE /api/users/:id  (admin)
exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) throw httpError(400, 'You cannot delete your own account');
  const user = await User.findById(req.params.id);
  if (!user) throw httpError(404, 'User not found');
  await Community.updateMany({}, { $pull: { members: user._id, invites: user._id } });
  await Notification.deleteMany({ $or: [{ recipient: user._id }, { sender: user._id }] });
  await user.deleteOne();
  ok(res, { message: 'User deleted' });
});

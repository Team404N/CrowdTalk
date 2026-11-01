// Communities: create, list, details, join/leave, invite + admin delete
const Community = require('../models/Community');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');
const { notifyUser } = require('../services/notificationService');
const { ok, httpError, asyncHandler, escapeRegex, isMember, communityOut } = require('../utils/helpers');

// POST /api/communities
exports.createCommunity = asyncHandler(async (req, res) => {
  const { name, description, category, type, isPrivate } = req.body;
  // Duplicate check: case-insensitive
  const exists = await Community.findOne({ name: { $regex: `^${escapeRegex(name.trim())}$`, $options: 'i' } });
  if (exists) throw httpError(400, 'A community with this name already exists');

  const community = await Community.create({
    name: name.trim(), description, category: category || 'General',
    type: type === 'private' || isPrivate === true ? 'private' : 'public',
    creator: req.user._id, members: [req.user._id],
  });
  await User.updateOne({ _id: req.user._id }, { $addToSet: { joinedCommunities: community._id } });
  ok(res, communityOut(community, req.user._id), 201);
});

// GET /api/communities?query=  -> all communities (private ones show a lock in the UI)
exports.getCommunities = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.query) {
    const rx = new RegExp(escapeRegex(req.query.query), 'i');
    filter.$or = [{ name: rx }, { description: rx }];
  }
  const list = await Community.find(filter).sort('-createdAt');
  ok(res, list.map((c) => communityOut(c, req.user._id)));
});

// GET /api/communities/:id  (member list only visible to members)
exports.getCommunityById = asyncHandler(async (req, res) => {
  const community = await Community.findById(req.params.id).populate('members', 'username email');
  if (!community) throw httpError(404, 'Community not found');
  const member = isMember(community, req.user._id);
  const memberList = member ? community.members.flatMap((m) => [m.username, m.email]) : [];
  ok(res, communityOut(community, req.user._id, memberList));
});

// POST /api/communities/:id/join  (private communities need an invite)
exports.joinCommunity = asyncHandler(async (req, res) => {
  const community = await Community.findById(req.params.id);
  if (!community) throw httpError(404, 'Community not found');
  if (isMember(community, req.user._id)) throw httpError(400, 'You are already a member of this community');
  if (community.type === 'private' && !community.invites.some((i) => i.equals(req.user._id))) {
    throw httpError(403, 'This community is private. You need an invitation to join.');
  }
  community.members.push(req.user._id);
  community.invites.pull(req.user._id);
  await community.save();
  await User.updateOne({ _id: req.user._id }, { $addToSet: { joinedCommunities: community._id } });
  ok(res, communityOut(community, req.user._id));
});

// POST /api/communities/:id/leave
exports.leaveCommunity = asyncHandler(async (req, res) => {
  const community = await Community.findById(req.params.id);
  if (!community) throw httpError(404, 'Community not found');
  if (!isMember(community, req.user._id)) throw httpError(400, 'You are not a member of this community');
  if (community.creator.equals(req.user._id)) throw httpError(400, 'The creator cannot leave their own community');
  community.members.pull(req.user._id);
  await community.save();
  await User.updateOne({ _id: req.user._id }, { $pull: { joinedCommunities: community._id } });
  ok(res, communityOut(community, req.user._id));
});

// POST /api/communities/:id/invite  { identifier: email or username }
exports.inviteMember = asyncHandler(async (req, res) => {
  const community = await Community.findById(req.params.id);
  if (!community) throw httpError(404, 'Community not found');
  if (!isMember(community, req.user._id)) throw httpError(403, 'Only members can invite others');

  const identifier = String(req.body.identifier || req.body.email || req.body.username || '').trim().toLowerCase().replace(/^@/, '');
  if (!identifier) throw httpError(400, 'Email or username is required');
  const invitee = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
  if (!invitee) throw httpError(404, 'No user found with that email or username');
  if (isMember(community, invitee._id)) throw httpError(400, 'User is already a member');
  if (community.invites.some((i) => i.equals(invitee._id))) throw httpError(400, 'User has already been invited');

  community.invites.push(invitee._id);
  await community.save();
  await notifyUser({ recipient: invitee._id, sender: req.user._id, type: 'invite', community: community._id });
  ok(res, { message: `Invitation sent to ${invitee.username}` });
});

// DELETE /api/communities/:id  (admin only - route level)
exports.deleteCommunity = asyncHandler(async (req, res) => {
  const community = await Community.findById(req.params.id);
  if (!community) throw httpError(404, 'Community not found');
  if (community.postsCount > 0) throw httpError(400, 'Cannot delete community with active discussions');
  await Resource.deleteMany({ community: community._id });
  await Notification.deleteMany({ community: community._id });
  await User.updateMany({}, { $pull: { joinedCommunities: community._id } });
  await community.deleteOne();
  ok(res, { message: 'Community deleted' });
});

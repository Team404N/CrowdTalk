// Resources: share links/guides in a community
const Resource = require('../models/Resource');
const Community = require('../models/Community');
const { notifyMembers } = require('../services/notificationService');
const { ok, httpError, asyncHandler, isMember, resourceOut } = require('../utils/helpers');

const populateRes = (q) => q.populate('sharedBy', 'username');

// POST /api/resources  { communityId, title, link|url, description, category }
exports.createResource = asyncHandler(async (req, res) => {
  const { communityId, title, description, category } = req.body;
  const link = req.body.link ?? req.body.url;
  const community = await Community.findById(communityId);
  if (!community) throw httpError(404, 'Community not found');
  if (!isMember(community, req.user._id)) throw httpError(403, 'Only community members can share resources');

  const resource = await Resource.create({ title, link, description, category, community: community._id, sharedBy: req.user._id });
  await notifyMembers({ community: community._id, sender: req.user._id, type: 'resource' });
  ok(res, resourceOut(await populateRes(Resource.findById(resource._id))), 201);
});

// GET /api/resources  -> resources from communities the user has joined
exports.getResources = asyncHandler(async (req, res) => {
  const joined = await Community.find({ members: req.user._id }).select('_id');
  const list = await populateRes(Resource.find({ community: { $in: joined.map((c) => c._id) } }).sort('-createdAt'));
  ok(res, list.map(resourceOut));
});

// GET /api/communities/:id/resources  (private + not a member => empty list)
exports.getCommunityResources = asyncHandler(async (req, res) => {
  const community = await Community.findById(req.params.id);
  if (!community) throw httpError(404, 'Community not found');
  if (community.type === 'private' && !isMember(community, req.user._id)) return ok(res, []);
  const list = await populateRes(Resource.find({ community: community._id }).sort('-createdAt'));
  ok(res, list.map(resourceOut));
});

// DELETE /api/resources/:id  (who shared it, the community creator, or an admin)
exports.deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) throw httpError(404, 'Resource not found');
  const community = await Community.findById(resource.community);
  const allowed = resource.sharedBy.equals(req.user._id) || req.user.role === 'admin' || community?.creator.equals(req.user._id);
  if (!allowed) throw httpError(403, 'You cannot delete this resource');
  await resource.deleteOne();
  ok(res, { message: 'Resource deleted' });
});

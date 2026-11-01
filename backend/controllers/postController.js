// Posts: create, feed, community posts, details, upvote, comments, search
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Community = require('../models/Community');
const { notifyMembers } = require('../services/notificationService');
const { ok, httpError, asyncHandler, escapeRegex, isMember, idOf, timeAgo, communityOut, postOut } = require('../utils/helpers');

const populatePost = (q) => q.populate('author', 'name username').populate('community', 'name');

// Loads a community and enforces membership. Used by every "write" action.
const requireMember = async (communityId, userId, action) => {
  const community = await Community.findById(communityId);
  if (!community) throw httpError(404, 'Community not found');
  if (!isMember(community, userId)) throw httpError(403, `Only community members can ${action}`);
  return community;
};

// POST /api/posts  { title, content|body, communityId, tags }
exports.createPost = asyncHandler(async (req, res) => {
  const { title, communityId } = req.body;
  const content = req.body.content ?? req.body.body ?? '';
  const tags = Array.isArray(req.body.tags) ? req.body.tags : String(req.body.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
  const community = await requireMember(communityId, req.user._id, 'post');

  const post = await Post.create({ title, content, tags, author: req.user._id, community: community._id });
  await Community.updateOne({ _id: community._id }, { $inc: { postsCount: 1 } });
  await notifyMembers({ community: community._id, sender: req.user._id, type: 'discussion' });
  const full = await populatePost(Post.findById(post._id));
  ok(res, postOut(full, req.user._id), 201);
});

// GET /api/posts?query=  -> feed: posts from communities the user has joined
exports.getFeedPosts = asyncHandler(async (req, res) => {
  const joined = await Community.find({ members: req.user._id }).select('_id');
  const filter = { community: { $in: joined.map((c) => c._id) } };
  if (req.query.query) filter.title = new RegExp(escapeRegex(req.query.query), 'i');
  const posts = await populatePost(Post.find(filter).sort('-createdAt').limit(50));
  ok(res, posts.map((p) => postOut(p, req.user._id)));
});

// GET /api/communities/:id/posts  (private + not a member => empty list, UI shows the lock)
exports.getCommunityPosts = asyncHandler(async (req, res) => {
  const community = await Community.findById(req.params.id);
  if (!community) throw httpError(404, 'Community not found');
  if (community.type === 'private' && !isMember(community, req.user._id)) return ok(res, []);
  const posts = await populatePost(Post.find({ community: community._id }).sort('-createdAt'));
  ok(res, posts.map((p) => postOut(p, req.user._id)));
});

// GET /api/posts/:id
exports.getPostById = asyncHandler(async (req, res) => {
  const post = await populatePost(Post.findById(req.params.id));
  if (!post) throw httpError(404, 'Post not found');
  const community = await Community.findById(post.community._id);
  if (community.type === 'private' && !isMember(community, req.user._id)) throw httpError(403, 'This discussion is in a private community');
  ok(res, postOut(post, req.user._id));
});

// POST /api/posts/:id/upvote  -> toggles the user's vote
exports.upvotePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw httpError(404, 'Post not found');
  await requireMember(post.community, req.user._id, 'upvote');
  const already = post.upvotes.some((u) => u.equals(req.user._id));
  if (already) post.upvotes.pull(req.user._id); else post.upvotes.push(req.user._id);
  await post.save();
  ok(res, { upvotes: post.upvotes.length, upvoted: !already });
});

// GET /api/posts/:id/comments  -> nested tree
exports.getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.id }).sort('createdAt').populate('author', 'username');
  const nodes = comments.map((c) => ({
    id: idOf(c), author: c.author?.username || 'deleted', text: c.content, createdAt: timeAgo(c.createdAt), replies: [], _parent: c.parent && idOf(c.parent),
  }));
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const roots = [];
  nodes.forEach((n) => { const parent = n._parent && byId[n._parent]; delete n._parent; (parent ? parent.replies : roots).push(n); });
  ok(res, roots);
});

// POST /api/posts/:id/comments  { content|text, parent? }  (members only)
exports.addComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw httpError(404, 'Post not found');
  await requireMember(post.community, req.user._id, 'comment');
  const content = req.body.content ?? req.body.text;
  if (!content || !String(content).trim()) throw httpError(400, 'Comment is required');
  let parent = null;
  if (req.body.parent) {
    parent = await Comment.findOne({ _id: req.body.parent, post: post._id });
    if (!parent) throw httpError(400, 'Parent comment not found on this post');
  }
  const comment = await Comment.create({ content: content.trim(), post: post._id, author: req.user._id, parent: parent?._id || null });
  await Post.updateOne({ _id: post._id }, { $inc: { commentsCount: 1 } });
  ok(res, { id: idOf(comment), author: req.user.username, text: comment.content, createdAt: 'just now', replies: [] }, 201);
});

// GET /api/posts/search?query=  -> communities (name/description) + posts (title)
exports.searchAll = asyncHandler(async (req, res) => {
  const q = String(req.query.query || '').trim();
  if (!q) return ok(res, { communities: [], posts: [] });
  const rx = new RegExp(escapeRegex(q), 'i');
  const communities = await Community.find({ $or: [{ name: rx }, { description: rx }] }).limit(20);
  // Only search posts the user is allowed to see: public communities or ones they joined
  const visible = await Community.find({ $or: [{ type: 'public' }, { members: req.user._id }] }).select('_id');
  const posts = await populatePost(Post.find({ title: rx, community: { $in: visible.map((c) => c._id) } }).sort('-createdAt').limit(30));
  ok(res, { communities: communities.map((c) => communityOut(c, req.user._id)), posts: posts.map((p) => postOut(p, req.user._id)) });
});

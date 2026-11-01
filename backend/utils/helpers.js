// Shared helpers: response format, errors, async wrapper and "shape for the frontend" serializers.
const BASE_URL = () => process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

// ---- Standard JSON contract: { success: true, data } ----
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });

// Throw httpError(400, 'message') from any controller; errorMiddleware turns it into { success:false, message }
const httpError = (status, message) => { const e = new Error(message); e.status = status; return e; };

// Express 4 does not catch async errors, so wrap controllers with this
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const idOf = (x) => String(x && x._id ? x._id : x);
const isMember = (community, userId) => community.members.some((m) => String(m._id || m) === String(userId));

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

// ---- Serializers (field names match what the React frontend expects) ----
const avatarUrl = (a) => (a && a.startsWith('/uploads') ? `${BASE_URL()}${a}` : a || '');

const userOut = (u, { withEmail = true } = {}) => ({
  id: idOf(u), name: u.name, username: u.username, ...(withEmail && { email: u.email }),
  role: u.role, avatar: avatarUrl(u.avatar), bio: u.bio, profession: u.profession, interests: u.interests,
});

const communityOut = (c, userId, memberList = []) => ({
  id: idOf(c), name: c.name, description: c.description, category: c.category, type: c.type,
  isPrivate: c.type === 'private', members: c.members.length, joined: isMember(c, userId),
  posts: c.postsCount, creator: idOf(c.creator), memberList,
});

const postOut = (p, userId) => ({
  id: idOf(p), title: p.title, body: p.content, content: p.content,
  author: p.author?.username || 'deleted', authorName: p.author?.name || 'Deleted user',
  communityId: idOf(p.community), community: p.community?.name || '', tags: p.tags,
  upvotes: p.upvotes.length, upvoted: p.upvotes.some((u) => String(u) === String(userId)),
  comments: p.commentsCount, createdAt: timeAgo(p.createdAt),
});

const resourceOut = (r) => ({
  id: idOf(r), communityId: idOf(r.community), title: r.title, url: r.link, link: r.link,
  description: r.description, category: r.category, author: r.sharedBy?.username || 'deleted', createdAt: timeAgo(r.createdAt),
});

module.exports = { ok, httpError, asyncHandler, escapeRegex, idOf, isMember, timeAgo, userOut, communityOut, postOut, resourceOut };

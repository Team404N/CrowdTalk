// /api/communities/*
const router = require('express').Router();
const c = require('../controllers/communityController');
const { getCommunityPosts } = require('../controllers/postController');
const { getCommunityResources } = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');

router.use(protect);
router.get('/', c.getCommunities);
router.post('/', validateBody({ name: { label: 'Name' }, description: { label: 'Description' } }), c.createCommunity);
router.get('/:id', c.getCommunityById);
router.get('/:id/posts', getCommunityPosts);
router.get('/:id/resources', getCommunityResources);
router.post('/:id/join', c.joinCommunity);
router.post('/:id/leave', c.leaveCommunity);
router.post('/:id/invite', c.inviteMember);
router.delete('/:id', adminOnly, c.deleteCommunity); // admin only

module.exports = router;

// /api/posts/*  ('/search' must come before '/:id')
const router = require('express').Router();
const c = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');

router.use(protect);
router.get('/', c.getFeedPosts);
router.get('/search', c.searchAll);
router.post('/', validateBody({ title: { label: 'Title' }, communityId: { label: 'Community' } }), c.createPost);
router.get('/:id', c.getPostById);
router.post('/:id/upvote', c.upvotePost);
router.get('/:id/comments', c.getComments);
router.post('/:id/comments', c.addComment);

module.exports = router;

// /api/resources/*
const router = require('express').Router();
const c = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');

router.use(protect);
router.get('/', c.getResources);
router.post('/', validateBody({ communityId: { label: 'Community' }, title: { label: 'Title' }, link: { label: 'Link', alias: 'url', url: true } }), c.createResource);
router.delete('/:id', c.deleteResource);

module.exports = router;

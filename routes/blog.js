const express = require('express');

// Here we assign our router
const router = express.Router();

// Here we are importing our time controller from the export object
const {
  create,
  list,
  listAllBlogsCategoriesTags,
  read,
  remove,
  update,
  photo,
  listRelated,
  listSearch,
  listByUser,
} = require('../controllers/blog');
const {
  requireSignin,
  adminMiddleware,
  authMiddleware,
  canUpdateDeleteBlog,
} = require('../controllers/auth');

// So now we are going to assign the routes to our router
router.post('/blog', requireSignin, adminMiddleware, create);
router.get('/blogs', list);
router.post('/blogs-categories-tags', listAllBlogsCategoriesTags);
router.get('/blog/:slug', read);
router.delete('/blog/:slug', requireSignin, adminMiddleware, remove);
router.put('/blog/:slug', requireSignin, adminMiddleware, update);
router.get('/blog/photo/:slug', photo);
router.post('/blogs/related', listRelated);
router.get('/blogs/search', listSearch);

// auth user blog crud
router.post('/user/blog', requireSignin, authMiddleware, create);
router.delete(
  '/user/blog/:slug',
  requireSignin,
  authMiddleware,
  canUpdateDeleteBlog,
  remove
);
router.put(
  '/user/blog/:slug',
  requireSignin,
  authMiddleware,
  canUpdateDeleteBlog,
  update
);

router.get('/:username/blogs', listByUser);

// we need to use this routing in our server.js so we must export
module.exports = router;

// This router and other routes can be xported from here
// the router is added to the module.exports object in the root of the
// node process

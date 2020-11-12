const express = require('express');
const router = express.Router();

// Here we are import our validators
const { runValidation } = require('../validators');
const { categoryCreateValidator } = require('../validators/category');

// Here we are import our controllers
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const { create, list, read, remove } = require('../controllers/category');

// Here we define what should happen when accessing the route.

// we do not want an update route for a category because its bad for SEO
// as the category is already indexed in yahoo and then it cannot find
// display the category
router.post(
  '/category',
  categoryCreateValidator,
  runValidation,
  requireSignin,
  adminMiddleware,
  create
);
router.get('/categories', list);
router.get('/category/:slug', read);
router.delete('/category/:slug', requireSignin, adminMiddleware, remove);

// we need to use this routing in our server.js so we must export
module.exports = router;

// This router and other routes can be xported from here
// the router is added to the module.exports object in the root of the
// node process

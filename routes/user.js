const express = require('express');

// Here we assign our router
const router = express.Router();

// Here we are importing our controllers from the export object
const { requireSignin, authMiddleware, adminMiddleware } = require('../controllers/auth');
const { read, publicProfile, update, photo } = require('../controllers/user');

router.get('/user/profile', requireSignin, authMiddleware, read);
router.get('/user/:username', publicProfile);
router.put('/user/update', requireSignin, authMiddleware, update);
router.get('/user/photo/:username', photo);

// we need to use this routing in our server.js so we must export
module.exports = router;

// This router and other routes can be xported from here
// the router is added to the module.exports object in the root of the
// node process

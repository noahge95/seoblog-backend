const express = require('express');

// Here we assign our router
const router = express.Router();

// Here we are importing our controllers from the export object
const {
  signup,
  signin,
  signout,
  requireSignin,
  forgotPassword,
  resetPassword,
  preSignup,
  googleLogin,
} = require('../controllers/auth');

// Here we are making sure we run our validators when we try to sign up.
const { runValidation } = require('../validators');
const {
  userSignupValidator,
  userSigninValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/auth');

// So now we are going to assign the routes to our router

router.post('/pre-signup', userSignupValidator, runValidation, preSignup);
router.post('/signup', signup);
router.post('/signin', userSigninValidator, runValidation, signin);
router.get('/signout', signout);
router.put('/forgot-password', forgotPasswordValidator, runValidation, forgotPassword);
router.put('/reset-password', resetPasswordValidator, runValidation, resetPassword);
// Google login.
router.post('/google-login', googleLogin);

// test to see if protected route is protected.
router.get('/secret', requireSignin, (req, res) => {
  res.json({ user: req.auth });
});

// we need to use this routing in our server.js so we must export
module.exports = router;

// This router and other routes can be xported from here
// the router is added to the module.exports object in the root of the
// node process

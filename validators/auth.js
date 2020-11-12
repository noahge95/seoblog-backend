const { check } = require('express-validator');

// These validators will create a validation result once run
// in index.js we check this result and send back error messages.

exports.userSignupValidator = [
  // check name and make sure its not empty.
  check('name').not().isEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Must be a valid email address'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

exports.userSigninValidator = [
  check('email').isEmail().withMessage('Must be a valid email address'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

exports.forgotPasswordValidator = [
  check('email').not().isEmpty().isEmail().withMessage('Must be a valid email address'),
];

exports.resetPasswordValidator = [
  check('newPassword')
    .not()
    .isEmpty()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

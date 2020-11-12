const { check } = require('express-validator');

exports.categoryCreateValidator = [
  // check name and make sure its not empty.
  check('name').not().isEmpty().withMessage('Name is required'),
];

const { validationResult } = require('express-validator');

// Here we Extract the validation errors from a request and make them available in the Result object.

// the errors are in an array of objects.

// if the object is not empty we have errors.
// we then return the message.

exports.runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array()[0].msg });
  }
  next();
};

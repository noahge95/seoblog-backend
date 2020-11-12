const express = require('express');
const router = express.Router();

const { runValidation } = require('../validators');
const { contactFormValidator } = require('../validators/form');

const { contactForm, contactBlogAuthorForm } = require('../controllers/form');

router.post('/contact', contactFormValidator, runValidation, contactForm);
router.post(
  '/contact-blog-author',
  contactFormValidator,
  runValidation,
  contactBlogAuthorForm
);

module.exports = router;

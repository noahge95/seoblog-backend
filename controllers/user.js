const User = require('../models/user');
const Blog = require('../models/blog');

const { errorHandler } = require('../helpers/dbErrorHandler');
const _ = require('lodash');
const fs = require('fs'); // gives access to file system
const formidable = require('formidable'); // to accept form data & image uploads

exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  return res.json(req.profile);
};

exports.update = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  // pass the request into the form.
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: 'Photo could not be uploaded',
      });
    }
    let user = req.profile;
    // This updates only the fields that have changed
    user = _.extend(user, fields);

    if (fields.password && fields.password.length < 6) {
      return res.status(400).json({
        error: 'Password should be at least 6 characters',
      });
    }

    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: 'Image should be less than 1mb',
        });
      }
      user.photo.data = fs.readFileSync(files.photo.path);
      user.photo.contentType = files.photo.type;
    }
    user.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: 'All filds required',
        });
      }
      user.hashed_password = undefined;
      user.salt = undefined;
      user.photo = undefined;
      res.json(user);
    });
  });
};

exports.photo = (req, res) => {
  const username = req.params.username;

  User.findOne({ username }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found',
      });
    }
    if (user.photo.data) {
      res.set('Content-Type', user.photo.contentType);
      return res.send(user.photo.data);
    }
  });
};

exports.publicProfile = (req, res) => {
  let username = req.params.username;
  let user;
  let blogs;

  // we populate the above variables and send them in the responce.

  User.findOne({ username }).exec((err, userFromDB) => {
    if (err || !userFromDB) {
      res.status(400).json({
        error: 'User not found',
      });
    }
    user = userFromDB;
    let userId = user._id;

    Blog.find({ postedBy: userId })
      .populate('categories', '_id name slug')
      .populate('tags', '_id name slug')
      .populate('postedBy', '_id name')
      .limit(10)
      .select('_id title slug excerpt categories tags postedBy createdAt updatedAt ')
      .exec((err, data) => {
        if (err) {
          res.status(400).json({
            error: errorHandler(err),
          });
        }
        user.photo = undefined;
        user.hashed_password = undefined;

        res.json({
          user,
          blogs: data,
        });
      });
  });
};

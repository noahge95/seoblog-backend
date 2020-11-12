const Category = require('../models/category');
const Blog = require('../models/blog');
const slugify = require('slugify');

const { errorHandler } = require('../helpers/dbErrorHandler');

// Here we create a new Category
exports.create = (req, res) => {
  const { name } = req.body;
  let slug = slugify(name).toLowerCase();

  let category = new Category({ name, slug });

  category.save((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    // this will send the category as the data object
    res.json(data);
  });
};

// Here we Read all the categories
exports.list = (req, res) => {
  Category.find({}).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.json(data);
  });
};

// Here we Read a single Category
exports.read = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  Category.findOne({ slug }).exec((err, category) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    // res.json(category);
    Blog.find({ categories: category })
      .populate('categories', '_id name slug')
      .populate('tags', '_id name slug')
      .populate('postedBy', '_id name')
      .select('_id title slug excerpt categories postedBy tags createdAt updatedAt')
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        res.json({ category: category, blogs: data });
      });
  });
};

// Here we Remove a single Category
exports.remove = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  Category.findOneAndRemove({ slug }).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.json({
      message: 'Category deleted successfully',
    });
  });
};

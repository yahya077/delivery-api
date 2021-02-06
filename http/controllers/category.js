const CustomError = require('../helpers/customError');
const asyncHandler = require('../middlewares/async');
const Category = require('../models/Category');

// @desc      Get all categories
// @route     GET /api/v1/categories
// @access    Public
exports.getCategories = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc      Get single category
// @route     GET /api/v1/categories/:id
// @access    Public
exports.getCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
  
    if (!category) {
      return next(
        new CustomError(`Category not found with id of ${req.params.id}`, 404)
      );
    }
  
    res.status(200).json({ success: true, data: category });
});

// @desc      Create new category
// @route     POST /api/v1/categories
// @access    Private
exports.createCategory = asyncHandler(async (req, res, next) => {
  
    const category = await Category.create(req.body);
  
    res.status(201).json({
      success: true,
      data: category
    });
});

// @desc      Update category
// @route     PUT /api/v1/categories/:id
// @access    Private
exports.updateCategory = asyncHandler(async (req, res, next) => {
    let category = await Category.findById(req.params.id);
  
    if (!category) {
      return next(
        new CustomError(`Category not found with id of ${req.params.id}`, 404)
      );
    }
  
    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
  
    res.status(200).json({ success: true, data: category });
});
  

// @desc      Delete category
// @route     DELETE /api/v1/categories/:id
// @access    Private
exports.deleteCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
  
    await category.remove();
  
    res.status(200).json({ success: true, data: {} });
});
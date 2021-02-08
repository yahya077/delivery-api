const CustomError = require('../helpers/customError');
const asyncHandler = require('../middlewares/async');
const geocoder = require('../../utils/geocoder');
const Company = require('../models/Company');
const User = require('../models/User');

// @desc      Get all companies
// @route     GET /api/v1/companies
// @access    Public
exports.getCompanies = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc      Get single company
// @route     GET /api/v1/companies/:id
// @access    Public
exports.getCompany = asyncHandler(async (req, res, next) => {
    const company = await Company.findById(req.params.id);
  
    if (!company) {
      return next(
        new CustomError(`Company not found with id of ${req.params.id}`, 404)
      );
    }
  
    res.status(200).json({ success: true, data: company });
});

// @desc      Create new company
// @route     POST /api/v1/users/:userId/companies
// @access    Private
exports.createCompany = asyncHandler(async (req, res, next) => {
    req.body.user = req.params.userId;

    const user = await User.findById(req.params.userId);

    if (!user) {
      return next(
        new CustomError(
          `No user with the id of ${req.params.userId}`,
          404
        )
      );
    }

  // Check for created company
  const publishedBootcamp = await Company.findOne({ user: req.params.userId });

  // Every user has only one company
  if (publishedBootcamp) {
    return next(
      new CustomError(
        `The user with ID ${req.user.id} has already created a company`,
        400
      )
    );
  }

  const company = await Company.create(req.body);

    res.status(201).json({
      success: true,
      data: company
    });
});

// @desc      Update company
// @route     PUT /api/v1/companies/:id
// @access    Private
exports.updateCompany = asyncHandler(async (req, res, next) => {
    let company = await Company.findById(req.params.id);
  
    if (!company) {
      return next(
        new CustomError(`Company not found with id of ${req.params.id}`, 404)
      );
    }
  
    company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
  
    res.status(200).json({ success: true, data: company });
});
  

// @desc      Delete company
// @route     DELETE /api/v1/companies/:id
// @access    Private
exports.deleteCompany = asyncHandler(async (req, res, next) => {
    const company = await Company.findById(req.params.id);
  
    await company.remove();
  
    res.status(200).json({ success: true, data: {} });
});

// @desc      Get companies within a radius
// @route     GET /api/v1/companies/radius/:zipcode/:distance
// @access    Public
exports.getCompaniesInRadius = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});
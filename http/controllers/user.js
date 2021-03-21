const CustomError = require('../helpers/customError');
const asyncHandler = require('../middlewares/async');
const User = require('../models/User');


// @desc      Get users
// @route     GET /api/v1/users/
// @access    Private
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single user
// @route     GET /api/v1/users/:id
// @access    Private
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
  
    if (!user) {
      return next(
        new CustomError(`User not found with id of ${req.params.id}`, 404)
      );
    }
  
    res.status(200).json({ success: true, data: user });
  });
const crypto = require('crypto');
const CustomError = require('../helpers/customError');
const asyncHandler = require('../middlewares/async');
const User = require('../models/User');
const { checkDuplicated, checkLogin } = require('../helpers/mongoErrorHandler');

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
    let status;
    const { firstName, lastName, email, password, role } = req.body;

    await checkDuplicated(User,{ email },'email', res);

    if(role === 'customer' || role === "" || role === undefined) status = "active"
    else if(role === 'admin') return next(new CustomError('Forbidden', 403));
    else status = "deActive"

    // Create user
    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        role,
        status
    })

    // return token
    sendTokenResponse(user, 200, res);
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    
    const user = await checkLogin(User, email, password, next);

    sendTokenResponse(user, 200, res);
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Public
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
  
    res.status(200).json({
      success: true,
      data: {},
    });
  });

// @desc      Get current logged in user
// @route     GET /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
// user is already available in req due to the protect middleware
    const user = req.user;

    res.status(200).json({
        success: true,
        data: user,
    });
});

// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email } = req.body;

    await checkDuplicated(User,{ email },'email', res);

    var fieldsToUpdate = checkFilledFields(firstName, lastName, email);    
  
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });
  
    res.status(200).json({
      success: true,
      data: user,
    });
  });

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
  
    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next(new CustomError('Password is incorrect', 401));
    }
  
    user.password = req.body.newPassword;
    await user.save();
  
    sendTokenResponse(user, 200, res);
  });


// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();
  
    const options = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
      ),
      httpOnly: true,
    };
  
    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }
  
    res.status(statusCode).cookie('token', token, options).json({
      success: true,
      token,
    });
  };

  // Check which fields will update
  const checkFilledFields = (firstName, lastName, email) => {
    const fields = {};
    firstName != undefined ? fields.firstName = firstName : undefined;
    lastName != undefined ? fields.lastName = lastName : undefined;
    email != undefined ? fields.email = email : undefined;
    return fields
  }
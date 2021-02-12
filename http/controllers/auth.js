const crypto = require('crypto');
const CustomError = require('../helpers/customError');
const asyncHandler = require('../middlewares/async');
const sendEmail = require('../helpers/sendMail');
const User = require('../models/User');
const Customer = require('../models/Customer');
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

    if(role === 'customer' || role === "" || role === undefined)
      await createCustomer(user);

    // send token email
    await sendEmailToken(user, req);

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

  // @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
  
    if (!user) {
      return next(new ErrorResponse('There is no user with that email', 404));
    }
  
    // Get reset token
    const resetToken = user.getResetPasswordToken();
  
    await user.save({ validateBeforeSave: false });
  
    // Create reset url
    const resetUrl = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/auth/resetpassword/${resetToken}`;
  
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
  
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message,
      });
  
      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
  
      await user.save({ validateBeforeSave: false });
  
      return next(new ErrorResponse('Email could not be sent', 500));
    }
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');
  
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
  
    if (!user) {
      return next(new ErrorResponse('Invalid token', 400));
    }
  
    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
  
    sendTokenResponse(user, 200, res);
  });

  
/**
 * @desc    Confirm Email
 * @route   GET /api/v1/auth/confirmemail
 * @access  Public
 */
exports.confirmEmail = asyncHandler(async (req, res, next) => {
    // grab token from email
    const { token } = req.query;
  
    if (!token) {
      return next(new ErrorResponse('Invalid Token', 400));
    }
  
    const splitToken = token.split('.')[0];
    const confirmEmailToken = crypto
      .createHash('sha256')
      .update(splitToken)
      .digest('hex');
  
    // get user by token
    const user = await User.findOne({
      confirmEmailToken,
      isEmailConfirmed: false,
    });
  
    if (!user) {
      return next(new ErrorResponse('Invalid Token', 400));
    }
  
    // update confirmed to true
    user.confirmEmailToken = undefined;
    user.isEmailConfirmed = true;
  
    // save
    user.save({ validateBeforeSave: false });
  
    // return token
    sendTokenResponse(user, 200, res);
  });

/////////////////////////////////* Functions *//////////////////////////////////////

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

// Send email confirmation
const sendEmailToken = async (user, req) => {
    // grab token and send to email
    const confirmEmailToken = user.generateEmailConfirmToken();

    // Create reset url
    const confirmEmailURL = `${req.protocol}://${req.get(
        'host',
    )}/api/v1/auth/confirmemail?token=${confirmEmailToken}`;

    const message = `You are receiving this email because you need to confirm your email address. Please make a GET request to: \n\n ${confirmEmailURL}`;

    user.save({ validateBeforeSave: false });

    const sendResult = await sendEmail({
        email: user.email,
        subject: 'Email confirmation token',
        message,
    });
}

// Create Customer if role is a customer
const createCustomer = asyncHandler(async (user) => {
  await Customer.create({
    name: user.firstName + " " + user.lastName,
    user: user._id,
  });
});

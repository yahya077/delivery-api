const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const CustomError = require('../helpers/customError');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Company = require('../models/Company');
const Driver = require('../models/Driver');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }
  // Set token from cookie
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Make sure token exists
  if (!token) {
    return next(new CustomError('Not authorized to access this route', 403));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    if(req.user.status != 'active')
      return next(new CustomError('Not authorized to access this route', 403));
    
    if(req.user.role == 'customer')
      req.user.customer = await Customer.findOne({user:req.user._id})
    else if(req.user.role == 'company')
      req.user.company = await Company.findOne({user:req.user._id})
    else if(req.user.role == 'driver')
      req.user.driver = await Driver.findOne({user:user._id})
    else console.log("Role is not found or admin");

    next();
  } catch (err) {
    return next(new CustomError('Not authorized to access this route', 403));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new CustomError(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
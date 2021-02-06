const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please add an firstName'],
        minlength: [4, 'The first name must be at least 4 characters'],
        maxlength: [15, 'The last name should not exceed 15 characters.'],
        trim:true
    },
    lastName: {
        type: String,
        required: [true, 'Please add an firstName'],
        minlength: [3, 'Password must be at least 3 characters'],
        maxlength: [15, 'The last name should not exceed 15 characters.'],
        trim:true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: [true, 'Email is already taken'],
        match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
        ],
        lowercase:true
    },
    role: {
        type: String,
        enum: ['customer', 'driver', 'company', 'admin'],
        default: 'customer',
    },
    status: {
        type: String,
        enum: ['active', 'deActive', 'banned', 'suspended'],
        default: 'deActive',
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [3, 'Password must be at least 3 characters'],
        select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    confirmEmailToken: String,
    isEmailConfirmed: {
        type: Boolean,
        default: false,
    },
    twoFactorCode: String,
    twoFactorCodeExpire: Date,
    twoFactorEnable: {
        type: Boolean,
        default: false,
    }
}, {collection:'users', timestamps:true});

 // Encrypt password using bcrypt
 UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      next();
    }
  
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });

  // Sign JWT and return
  UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  };
  
  // Match user entered password to hashed password in database
  UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
  
  // Generate and hash password token
  UserSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
  
    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
    return resetToken;
  };
  
  // Generate email confirm token
  UserSchema.methods.generateEmailConfirmToken = function (next) {
    // email confirmation token
    const confirmationToken = crypto.randomBytes(20).toString('hex');
  
    this.confirmEmailToken = crypto
      .createHash('sha256')
      .update(confirmationToken)
      .digest('hex');
  
    const confirmTokenExtend = crypto.randomBytes(100).toString('hex');
    const confirmTokenCombined = `${confirmationToken}.${confirmTokenExtend}`;
    return confirmTokenCombined;
  };

module.exports = mongoose.model('User', UserSchema);
const express = require('express');

const { register, login, logout, getMe, updateDetails, updatePassword, forgotPassword, resetPassword, confirmEmail} = require('../http/controllers/auth');
const validate = require('../http/providers/ValidatorServiceProvider');
const {checkValidationError} = require('../http/helpers/ValidationErrorResponse');

const router = express.Router();

const { protect, authorize } = require('../http/middlewares/auth');


router
    .post('/register',validate.register(), checkValidationError, register)
    .post('/login',validate.login(), checkValidationError, login)
    .post('/forgotpassword', forgotPassword);

router
    .get('/logout',protect, logout)
    .get('/me', protect, getMe)
    .get('/confirmemail', confirmEmail);

router
    .put('/updatedetails', protect, authorize('customer', 'admin'), updateDetails)
    .put('/updatepassword', protect, updatePassword)
    .put('/resetpassword/:resettoken', resetPassword);




module.exports = router;
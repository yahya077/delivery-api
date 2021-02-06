const express = require('express');

const { register, login, logout } = require('../http/controllers/auth');
const validate = require('../http/providers/ValidatorServiceProvider');
const {checkValidationError} = require('../http/helpers/ValidationErrorResponse');

const router = express.Router();

const { protect } = require('../http/middlewares/auth');


router
    .post('/register',validate.register(), checkValidationError, register)
    .post('/login',validate.login(), checkValidationError, login);
    
router.get('/logout',protect, logout);

module.exports = router;
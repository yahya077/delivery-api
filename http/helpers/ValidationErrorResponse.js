const { validationResult } = require('express-validator');

const checkValidationError = (req,res,next) => {
    if(!validationResult(req).isEmpty()) return res.status(422).json({ success: false, data: validationResult(req).array() }) // checking validation error
    next();// if it has no error will send to the controller
}

module.exports = {
    checkValidationError
}
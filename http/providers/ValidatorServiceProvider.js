const { body } = require('express-validator');

const login = _ => {
    return [
        body('email')
            .trim()
            .isEmail().withMessage('Your email is not valid'),
        body('password')
            .trim()
            .isLength({min:3}).withMessage('Your password must be at least 3 characters')
        ]
}


const register = _ => {
    return [
        body('email')
            .trim()
            .isEmail().withMessage('Your email is not valid'),
        body('password')
            .trim()
            .isLength({min:3}).withMessage('Your password must be at least 3 characters'),
        body('firstName')
            .trim()
            .isLength({min:3}).withMessage('Name must min 3 characters')
            .isLength({max:20}).withMessage('Name must have max 20 characters'),
        body('lastName')
            .trim().isLength({min:3}).withMessage('Last name must min 3 characters')
            .isLength({max:20}).withMessage('Last name must have max 20 characters'), 
        body('rePassword')
            .trim()
            .custom((val, {req}) => {
                if(val !== req.body.password)
                    throw new Error('Password confirmation does not match password')
                    
                return true;
            })
        ]
        
}

module.exports = {
    register,
    login
}
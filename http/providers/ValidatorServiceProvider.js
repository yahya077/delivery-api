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

const category = _ => {
    return [
        body('name')
            .trim()
            .isLength({min:5}).withMessage('Name must be at least 5 characters')
            .isLength({max:40}).withMessage('Name can not be more than 40 characters'),
        body('description')
            .trim()
            .isLength({min:5}).withMessage('Name must be at least 5 characters')
            .isLength({max:240}).withMessage('Name can not be more than 240 characters'),
        body('mobileIcon')
            .trim(),
        body('webIcon')
            .trim(),
        body('coverImage')
            .trim()
        ]
}

const company = _ => {
    return [
        body('brandName')
            .trim()
            .isLength({min:2}).withMessage('Brand name must be at least 2')
            .isLength({max:20}).withMessage('Brand name can not be longer than 20 characters'),
        body('phone')
            .trim()
            .isLength({min:10}).withMessage('Phone number can not be less than 10 characters')
            .isLength({max:10}).withMessage('Phone number can not be longer than 10 characters'),
        body('address')
            .trim()
            .notEmpty().withMessage('Address can not be empty'),
        body('addressDescription')
            .trim()
            .notEmpty().withMessage('Address description can not be empty'),
        body('type')
            .trim()
            .notEmpty().withMessage('Type can not be empty'),
        ]
}

module.exports = {
    register,
    login,
    category,
    company
}
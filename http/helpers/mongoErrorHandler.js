const CustomError = require('../helpers/customError');


const checkDuplicated = async (model, objects, param, res) => {
    // Check for published bootcamp
    const checkDublicated = await model.findOne(objects);
    if(checkDublicated) return res.status(422).json({ success: false,
         data: [{"msg" : `The ${param} is already taken.`, param}]
        })
}

const checkLogin = async (model, email, password, next) => {
    const user = await model.findOne({ email }).select('+password');

    if (!user) {
        return next(new CustomError('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new CustomError('Invalid credentials', 401));
    }

    return user;
}

module.exports = {
    checkDuplicated,
    checkLogin
}
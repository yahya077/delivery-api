const CustomError = require('../helpers/customError');

const checkExistModal = (model) => async (req, res, next) => {
    const data = await model.findById(req.params.id);

    if (!data) {
      return next(
        new CustomError(`Data not found with id of ${req.params.id}`, 404)
      );
    }
    req.model = data;
    next();
}

module.exports = checkExistModal;
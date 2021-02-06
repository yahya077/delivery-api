const express = require('express');
const validate = require('../http/providers/ValidatorServiceProvider');
const {checkValidationError} = require('../http/helpers/ValidationErrorResponse');


const { createCategory,
        getCategories,
        getCategory,
        deleteCategory,
        updateCategory
} = require('../http/controllers/category');

const Category = require('../http/models/Category');

const router = express.Router();

const advancedResults = require('../http/middlewares/advancedResults');

const { protect, authorize } = require('../http/middlewares/auth');

router.route('/')
    .get(advancedResults(Category), getCategories)
    .post(protect, authorize('admin'),validate.category(),checkValidationError, createCategory);

router.route('/:id')
    .get(getCategory)
    .delete(protect, authorize('admin'), deleteCategory)
    .put(protect,authorize('admin'), updateCategory);
module.exports = router;

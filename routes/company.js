const express = require('express');
const validate = require('../http/providers/ValidatorServiceProvider');
const {checkValidationError} = require('../http/helpers/ValidationErrorResponse');

const { getCompanies,
        getCompany,
        deleteCompany,
        updateCompany,
        createCompany
} = require('../http/controllers/company');

const Company = require('../http/models/Company');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../http/middlewares/advancedResults');

const { protect, authorize } = require('../http/middlewares/auth');

router.route('/')
    .get(advancedResults(Company), getCompanies)
    .post(protect, authorize('admin'),validate.company(), checkValidationError, createCompany);

router.route('/:id')
    .get(protect, authorize('admin'), getCompany)
    .delete(protect, authorize('admin'), deleteCompany)
    .put(protect,authorize('admin'), updateCompany);
    
module.exports = router;
const express = require('express');
const validate = require('../http/providers/ValidatorServiceProvider');
const {checkValidationError} = require('../http/helpers/ValidationErrorResponse');

const { getCompanies,
        getCompany,
        deleteCompany,
        updateCompany,
        createCompany,
        getCompaniesInRadius
} = require('../http/controllers/company');

const Company = require('../http/models/Company');

//Include other resource router
const menuItemRouter = require('./menuItem');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../http/middlewares/advancedResults');
const { protect, authorize } = require('../http/middlewares/auth');

// Re-route into other resource routers
router.use('/:id/menu-items', menuItemRouter);


router.route('/')
    .get(advancedResults(Company,[
      {
        path: 'category',
        select: 'name'
      },
      {
        path: 'menuItems'
      }
    ]), getCompanies)
    .post(protect, authorize('admin'),validate.company(), checkValidationError, createCompany);

router.route('/:id')
    .get(protect, authorize('admin'), getCompany)
    .delete(protect, authorize('admin'), deleteCompany)
    .put(protect,authorize('admin'), updateCompany);

router.route('/radius/:zipcode/:distance').get(advancedResults(Company,
  [{
    path: 'category',
    select: 'name'
  },
  {
    path: 'menuItems'
  }]
  ), getCompaniesInRadius);

module.exports = router;
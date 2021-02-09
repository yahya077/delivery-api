const express = require('express');
const validate = require('../http/providers/ValidatorServiceProvider');
const {checkValidationError} = require('../http/helpers/ValidationErrorResponse');

const { createMenuItem,
        getMenuItems,
        getMenuItem,
        deleteMenuItem,
        updateMenuItem
} = require('../http/controllers/menuItem');

const MenuItem = require('../http/models/MenuItem');

const router = express.Router();

const advancedResults = require('../http/middlewares/advancedResults');

const { protect, authorize } = require('../http/middlewares/auth');

router.route('/')
    .get(advancedResults(MenuItem,{
        path: 'category',
        select: 'name description'
      },'company'), getMenuItems)
    .post(protect, authorize('admin'),validate.menuItem(),checkValidationError, createMenuItem);

router.route('/:id')
    .get(getMenuItem)
    .delete(protect, authorize('admin'), deleteMenuItem)
    .put(protect,authorize('admin'), updateMenuItem);
module.exports = router;

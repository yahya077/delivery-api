const express = require('express');
const Driver = require('../http/models/Driver');
const validate = require('../http/providers/ValidatorServiceProvider');
const {checkValidationError} = require('../http/helpers/ValidationErrorResponse');
const { getDriver,
    getDrivers,
    createDriver,
    setDriverSpots,
    removeDriverSpot,
    findAvailableDriversNear

} = require('../http/controllers/driver');

const router = express.Router({ mergeParams: true });

// Middlewares
const advancedResults = require('../http/middlewares/advancedResults');

const { protect, authorize } = require('../http/middlewares/auth');

router.route('/')
        .get(protect, authorize('admin'),advancedResults(Driver,{
            path: 'driverSpots',
            select: 'status'
        },), getDrivers)
        .post(protect, authorize('admin'),validate.driver(), checkValidationError, createDriver);
router.route('/:driverId')
        .get(protect, authorize('admin', 'driver'), getDriver);

router.route('/:driverId/driver-spots')
        .post(protect, authorize('admin', 'driver'), setDriverSpots)
        .delete(protect,authorize('admin','driver'), removeDriverSpot);

router.route('/driver-spots/radius/:lng/:lat/:distance')
        .get(protect, authorize('admin','company'), findAvailableDriversNear);

module.exports = router;
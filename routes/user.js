const express = require('express');
const { getUser, getUsers } = require('../http/controllers/user');

// Include other resource router
const companyRouter = require('./company');
const driverRouter = require('./driver');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../http/middlewares/auth');
const advancedResults = require('../http/middlewares/advancedResults');
const User = require('../http/models/User');

// Re-route into other resource routers
router.use('/:userId/companies', companyRouter);
router.use('/:userId/drivers', driverRouter);

router
  .route('/:id')
  .get(protect, authorize('admin'), getUser);

router.route('/').get(protect, authorize('admin'),advancedResults(User), getUsers);

module.exports = router;


const express = require('express');
const { getUser } = require('../http/controllers/user');

// Include other resource router
const companyRouter = require('./company');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../http/middlewares/auth');

// Re-route into other resource routers
router.use('/:userId/companies', companyRouter);

router
  .route('/:id')
  .get(protect, authorize('admin'), getUser);

module.exports = router;


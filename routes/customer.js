const express = require('express');
const Customer = require('../http/models/Customer');
const { getCustomer,
        getCustomers

 } = require('../http/controllers/customer');

//Include other resource router
const addressRouter = require('./address');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../http/middlewares/advancedResults');

const { protect, authorize } = require('../http/middlewares/auth');

// Re-route into other resource routers
router.use('/:customerId/addresses', addressRouter);

router.route('/')
        .get(protect, authorize('admin'),advancedResults(Customer,{path:'addresses'}), getCustomers);

router.route('/:id')
        .get(protect, authorize('admin', 'customer'), getCustomer);

module.exports = router;

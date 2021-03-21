const express = require('express');
const Customer = require('../http/models/Customer');
const { getCustomer,
        getCustomers

 } = require('../http/controllers/customer');

//Include other resource router
const addressRouter = require('./address');
const basketRouter = require('./basket');
const orderRouter = require('./order');

const router = express.Router({ mergeParams: true });

// Middlewares
const advancedResults = require('../http/middlewares/advancedResults');
const checkExistModal = require('../http/middlewares/checkExistModal');

const { protect, authorize } = require('../http/middlewares/auth');

// Re-route into other resource routers
router.use('/:id/addresses', checkExistModal(Customer), addressRouter);
router.use('/:id/baskets', checkExistModal(Customer),basketRouter);
router.use('/:id/orders', checkExistModal(Customer),orderRouter);

router.route('/')
        .get(protect, authorize('admin'),advancedResults(Customer,{path:'addresses'}), getCustomers);

router.route('/:customerId')
        .get(protect, authorize('admin', 'customer'), getCustomer);

module.exports = router;

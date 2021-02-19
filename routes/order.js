const express = require('express');

const {
    getCompanyOrders,
    getCustomerOrders,
    createOrder,
    createOrderStatus
} = require('../http/controllers/order');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../http/middlewares/auth');

router.route('/')
        .post(protect, authorize('admin', 'customer'), createOrder);
router.route('/company')
        .get(protect, authorize('admin', 'company'), getCompanyOrders);
router.route('/customer')
        .get(protect, authorize('admin', 'customer'), getCustomerOrders);
router.route('/:id/status')
        .post(protect, createOrderStatus);
        
module.exports = router;

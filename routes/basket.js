const express = require('express');

const { getCustomerBaskets,
        getCustomerBasket,
        addItemToBasket,
        removeItemFromBasket,
        updateItemFromBasket     
}
    = require('../http/controllers/basket');

//Include other resource router
const orderRouter = require('./order');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../http/middlewares/auth');
const checkExistModal = require('../http/middlewares/checkExistModal');

// Re-route into other resource routers
router.use('/:id/orders', orderRouter);

router.route('/')
        .get(protect, authorize('admin', 'customer'), getCustomerBaskets);
router.route('/:basketId')
        .get(protect, authorize('admin', 'customer'), getCustomerBasket);
// TODO: Add middleware for if customer has that basket
router.route('/add-item')
        .post(protect, authorize('admin', 'customer'), addItemToBasket);
router.route('/remove-item')
        .delete(protect, authorize('admin', 'customer'), removeItemFromBasket)
router.route('/update-item')
        .put(protect, authorize('admin', 'customer'), updateItemFromBasket)

module.exports = router;

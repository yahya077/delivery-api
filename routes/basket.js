const express = require('express');

const { getCustomerBaskets,
        addItemToBasket        
}
    = require('../http/controllers/basket');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../http/middlewares/auth');

router.route('/')
        .get(protect, authorize('admin', 'customer'), getCustomerBaskets);

router.route('/add-item')
        .post(protect, authorize('admin', 'customer'), addItemToBasket);

module.exports = router;

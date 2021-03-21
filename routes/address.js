const express = require('express');

const {getAddresses,
        getAddress,
        createAddress
} = require('../http/controllers/address');
const advancedResults = require('../http/middlewares/advancedResults');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../http/middlewares/auth');
const Address = require('../http/models/Address');

router.route('/')
        .post(protect, authorize('admin','customer'),createAddress)
        .get(protect, authorize('admin','customer'), getAddresses);

router.route('/:addressId')
        .get(protect, authorize('admin','customer'), getAddress);

module.exports = router;
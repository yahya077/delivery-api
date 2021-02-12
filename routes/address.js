const express = require('express');

const {
        getAddress,
        createAddress
} = require('../http/controllers/address');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../http/middlewares/auth');

router.route('/')
        .post(protect, authorize('admin','customer'),createAddress);

router.route('/:id')
        .get(protect, authorize('admin','customer'), getAddress);

module.exports = router;
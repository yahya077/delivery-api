const express = require('express');
const { createRide
}
= require('../http/controllers/ride');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../http/middlewares/auth');

router.route('/')
        .post(protect, authorize('admin','driver'),createRide);
module.exports = router;

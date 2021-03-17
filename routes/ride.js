const express = require('express');
const { createRide
}
= require('../http/controllers/ride');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../http/middlewares/auth');

router.route('/')
        .post(createRide);
module.exports = router;

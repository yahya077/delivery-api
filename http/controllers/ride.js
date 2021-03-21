const CustomError = require('../helpers/customError');
const asyncHandler = require('../middlewares/async');
const geocoder = require('../../utils/geocoder');
var distance = require('google-distance');
distance.apiKey = 'AIzaSyDPpbRKk73iJILLN2-CCMXy4XEK8Xq0k_w';
const Driver = require('../models/Driver');
const Order = require('../models/Order');
const Ride = require('../models/Ride');
const { now } = require('mongoose');

// @desc      Create Ride
// @route     GET /api/v1/rides/
// @access    Private
exports.createRide = asyncHandler( async (req,res, next) => {
    const stdDeliveryAmount = 2;
    const driver = await Driver.findById(req.body.driver);
    if(!driver){
        return next(
            new CustomError(`Driver not found with id of ${req.body.driver}`, 404)
          );
    }
    const order = await Order.findById(req.body.order).populate('company');
    if(!order){
        return next(
            new CustomError(`Order not found with id of ${req.body.order}`, 404)
          );
    }

    await distance.get({
        origin: order.company.location.coordinates[1]+','+order.company.location.coordinates[0],
        destination: order.address.location.coordinates[1]+','+order.address.location.coordinates[0]
    }, async function(err, data){
        if (err) return console.log(err);
        console.log(data);
        const dValue = data.distanceValue / 1000;
        const deliveryPrice = dValue * stdDeliveryAmount;
        const ride = await Ride.create({
            order: order._id,
            driver:driver._id,
            acceptedTime: now(),
            address: order.address,
            price: {
                display: deliveryPrice,
                currency: 'tl'
            },
        });

        res.status(200).json({
            success: true,
            data: ride
          });
    });
});
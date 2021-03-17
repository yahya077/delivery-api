const CustomError = require('../helpers/customError');
const asyncHandler = require('../middlewares/async');
const geocoder = require('../../utils/geocoder');
var distance = require('google-distance');
distance.apiKey = 'AIzaSyDPpbRKk73iJILLN2-CCMXy4XEK8Xq0k_w';
const Driver = require('../models/Driver');
const Order = require('../models/Order');

// @desc      Create Ride
// @route     GET /api/v1/rides/
// @access    Private
exports.createRide = asyncHandler( async (req,res, next) => {
/*     const driver = await Driver.findById(req.body.driver);
    if(!driver){
        return next(
            new CustomError(`Driver not found with id of ${req.body.driver}`, 404)
          );
    } */
    const order = await Order.findById(req.body.order);
    if(!order){
        return next(
            new CustomError(`Order not found with id of ${req.body.order}`, 404)
          );
    }
    
    const address = order.address;
   /*  const currentLongitude = req.body.longitude;
    const currentLatidu = req.body.longitude; */
    console.log(order.address.location.coordinates[0]+','+order.address.location.coordinates[1]);
    const currentDistance = distance.get({
        origin: order.address.location.coordinates[1]+','+order.address.location.coordinates[0],
        destination: order.address.location.coordinates[1]+','+order.address.location.coordinates[0]
    }, function(err, data){
        if (err) return console.log(err);
        console.log(data);
    });
});
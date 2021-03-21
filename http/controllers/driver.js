const asyncHandler = require('../middlewares/async');
const Driver = require('../models/Driver');
const CustomError = require('../helpers/customError');
const User = require('../models/User');
const DriverSpot = require('../models/DriverSpot');
const geocoder = require('../../utils/geocoder');


// @desc      Get drivers
// @route     GET /api/v1/drivers
// @access    Private
exports.getDrivers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc      Get single driver
// @route     GET /api/v1/drivers/:driverId
// @access    Private
exports.getDriver = asyncHandler(async (req, res, next) => {
    let driver = await Driver.findById(req.params.driverId);

    if (!driver) {
        return next(
          new CustomError(`Driver not found with id of ${req.params.driverId}`, 404)
        );
      }
  
    if(req.user.role != 'admin' && driver.user != req.user.id){
        return next(
            new CustomError(`Access Denied`, 401)
        );
    }

    res.status(200).json({ success: true, data: driver });
});

// @desc      Create new driver
// @route     POST /api/v1/users/:userId/drivers
// @access    Private
exports.createDriver = asyncHandler(async (req, res, next) => {
    req.body.user = req.params.userId;

    const user = await User.findById(req.params.userId);

    if (!user) {
      return next(
        new CustomError(
          `No user with the id of ${req.params.userId}`,
          404
        )
      );
    }

    if (user.role != 'driver') {
      return next(
        new CustomError(
          `The user with ID ${req.params.userId} is not a driver`,
          404
        )
      );
    }

  // Check for created driver
  // TODO: add a function to check if user has created a role 
  const driverCheck = await Driver.findOne({ user: req.params.userId });

  // Every user has only one role
  if (driverCheck) {
    return next(
      new CustomError(
        `The user with ID ${req.user.id} already has a role`,
        400
      )
    );
  }

  const driver = await Driver.create(req.body);

    res.status(201).json({
      success: true,
      data: driver
    });
});

// @desc      Set-Update Driver Spots
// @route     post /api/v1/drivers/:driverId/driver-spots
// @access    Private

exports.setDriverSpots = asyncHandler( async (req, res, next) => {
  const { lg, lt } = req.body;
  const driver = await Driver.findById(req.params.driverId);
  if (!driver) {
    return next(
      new CustomError(
        `No driver with the id of ${req.params.driverId}`,
        404
      )
    );
  }
  req.body.driver = req.params.driverId;
  const checkDriverSpot = await DriverSpot.findOne({driver:req.params.driverId});
 
  req.body.coordinates = [lg,lt];
  console.log(req.body.coordinates);
  if(checkDriverSpot){
    await DriverSpot.findByIdAndUpdate(checkDriverSpot._id,req.body);

    res.status(200).json({
      success: true,
      data: req.body.coordinates
    });
  }else{
    await DriverSpot.create(req.body);

    res.status(200).json({
      success: true,
      data: req.body.coordinates
    });
  }

});

// @desc      Remove Driver Spots
// @route     Delete /api/v1/drivers/:driverId/driver-spots
// @access    Private
exports.removeDriverSpot = asyncHandler( async (req,res,next) => {
  const driver = await Driver.findById(req.params.driverId);
  if (!driver) {
    return next(
      new CustomError(
        `No driver with the id of ${req.params.driverId}`,
        404
      )
    );
  }
  await DriverSpot.findOneAndRemove({driver:req.params.driverId});
  
  res.status(200).json({ success: true, data: {} });

});

// @desc      Find all near available drivers
// @route     Get /api/v1/driver-spots/radius/:lng/:lat/:distance
// @access    Private
exports.findAvailableDriversNear = asyncHandler( async (req, res, next) => {

  const { lng,lat, distance } = req.params;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 6378;

  const availableDrivers = await DriverSpot.find({
    status: 'Available',
    coordinates: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  },{driver:1}).populate('driver', ['name','phone']);

  res.status(200).json({
    success: true,
    count: availableDrivers.length,
    data: availableDrivers
  });

});


// TODO: update driver

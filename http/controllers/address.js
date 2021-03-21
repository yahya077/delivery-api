const asyncHandler = require('../middlewares/async');
const Customer = require('../models/Customer');
const Address = require('../models/Address');
const CustomError = require('../helpers/customError');


// @desc      Get Customers Addresses
// @route     POST /api/v1/customer/:customerId/addresses/
// @access    Private
exports.getAddresses = asyncHandler( async (req, res, next) => {
    if(req.user.role != 'admin' && req.model.user != req.user.id){
        return next(
            new CustomError(`Access Denied`, 401)
        );
    }

    const addresses = await Address.find({ customer:req.params.id});

    res.status(200).json({success: true, data: addresses});
});

// @desc      Get Customer Single Address
// @route     POST /api/v1/customer/:id/addresses/:addressId
// @access    Private
exports.getAddress = asyncHandler( async (req, res, next) => {
    if(req.user.role != 'admin' && req.model.user != req.user.id){
        return next(
            new CustomError(`Access Denied`, 401)
        );
    }

    const address = await Address.findOne({ customer:req.params.id, _id: req.params.addressId});

    if (!address) {
        return next(
          new CustomError(`Address not found with id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({success: true, data: address});

});

// @desc      Create new Address
// @route     POST /api/v1/customer/:id/addresses
// @access    Private
exports.createAddress = asyncHandler( async (req, res, next) => {
    if(req.user.role != 'admin' && req.model.user != req.user.id){
        return next(
            new CustomError(`Access Denied`, 401)
        );
    }

    // passing id into body
    req.body.customer = req.model._id;

    const address = await Address.create(req.body)
    
    res.status(200).json({ success: true, data: customer });
});

const asyncHandler = require('../middlewares/async');
const Customer = require('../models/Customer');
const Address = require('../models/Address');
const CustomError = require('../helpers/customError');

// @desc      Get Customer Single Address
// @route     POST /api/v1/customer/:customerId/addresses/:id
// @access    Private
exports.getAddress = asyncHandler( async (req, res, next) => {
    const customer = await Customer.findById(req.params.customerId);

    if (!customer) {
        return next(
          new CustomError(`Customer not found with id of ${req.params.customerId}`, 404)
        );
    }


    console.log(req.user.id);
    if(req.user.role != 'admin' && customer.user != req.user.id){
        return next(
            new CustomError(`Access Denied`, 401)
        );
    }

    const address = await Address.findOne({ customer:req.params.customerId, _id: req.params.id});

    if (!address) {
        return next(
          new CustomError(`Address not found with id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({success: true, data: address});

});

// @desc      Create new Address
// @route     POST /api/v1/customer/:customerId/addresses
// @access    Private
exports.createAddress = asyncHandler( async (req, res, next) => {

    const customer = await Customer.findById(req.params.customerId);
    
    if (!customer) {
        return next(
          new CustomError(`Customer not found with id of ${req.params.customerId}`, 404)
        );
    }
  
    if(req.user.role != 'admin' && customer.user != req.user.id){
        return next(
            new CustomError(`Access Denied`, 401)
        );
    }

    req.body.customer = customer._id;

    const address = await Address.create(req.body)
    
    res.status(200).json({ success: true, data: customer });
});

const asyncHandler = require('../middlewares/async');
const Customer = require('../models/Customer');
const CustomError = require('../helpers/customError');


// @desc      Get customers
// @route     GET /api/v1/customers
// @access    Private
exports.getCustomers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc      Get single customer
// @route     GET /api/v1/customers/:id
// @access    Private
exports.getCustomer = asyncHandler(async (req, res, next) => {
    let customer = await Customer.findById(req.params.id).populate({path:'addresses'});

    if (!customer) {
        return next(
          new CustomError(`Customer not found with id of ${req.params.id}`, 404)
        );
      }
  
    if(req.user.role != 'admin' && customer.user != req.user.id){
        return next(
            new CustomError(`Access Denied`, 401)
        );
    }

    res.status(200).json({ success: true, data: customer });
});
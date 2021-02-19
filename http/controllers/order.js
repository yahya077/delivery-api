const CustomError = require('../helpers/customError');
const asyncHandler = require('../middlewares/async');
const Address = require('../models/Address');
const Basket = require('../models/Basket');
const InOrder = require('../models/InOrder');
const Order = require('../models/Order');
const Company = require('../models/Company');
const OrderStatus = require('../models/OrderStatus');
const Customer = require('../models/Customer');

// @desc      Create Order
// @route     POST /api/v1/baskets/:basketId/orders
// @access    Private
exports.createOrder = asyncHandler( async (req, res, next) => {
    const basket = await Basket
            .findOne({_id:req.params.basketId, status:'active'})
            .populate({path:'inOrders', populate: 'menuItem'});
            
    if(!basket){
        return next(
            new CustomError(`Basket not found with id of ${req.params.basketId}`, 404)
        );
    }
    const totalPrice = await InOrder.aggregate([
        {
            $match: { basket: basket._id }
        },
        {  
        $group: {
            _id: '$price.currency',
            total: { $sum: '$price.display' },
        }
        }
    ]);
    
    const userAddress = await Address.findById(req.body.address);
    // TODO: fix with adding middleware 
    if(userAddress.customer != req.user._id && req.user.role != 'admin'){
        return next(
            new CustomError(`Access Denied`, 401)
        );
    }

    const address = {
        phone: userAddress.phone,
        description: userAddress.description,
        location: userAddress.location
    }

    const price = {
        display: totalPrice[0].total,
        currency: totalPrice[0]._id
    }


    req.body.basket = req.params.basketId;
    req.body.address = address;
    req.body.price = price;
    req.body.customer = userAddress.customer;
    console.log(basket.customer);
    req.body.company = basket.company;
    console.log(basket.company);
    const order = await Order.create(req.body);
    const orderStatus = await OrderStatus.create({order: order._id});
    // console.log(orderStatus);
    basket.status = 'ordered';
    basket.save();
    res.status(200).json({success: true, data: order}); 
});

// @desc      Get Company Orders
// @route     POST /api/v1/companies/:companyId/orders/company
// @access    Private
exports.getCompanyOrders = asyncHandler( async (req, res, next) => {
    const company = await Company.findById(req.params.companyId);
    
    let orders = await Order.find({company: company._id})
                        .populate([{path:'orderStatuses'},
                        {path: 'basket',
                            populate: {
                            path: 'inOrders',
                            populate: 'menuItem'
                        }}]);                       
    if(orders == undefined) orders = [];
    res.status(200).json({success: true, data: orders});
});

// @desc      Get Customer Orders
// @route     POST /api/v1/customers/:customerId/orders/customer
// @access    Private
exports.getCustomerOrders = asyncHandler( async (req, res, next) => {
    const customer = await Customer.findById(req.params.customerId);

    let orders = await Order.find({customer: customer._id})
                        .populate([{path:'orderStatuses'},
                        {path: 'basket',
                            populate: {
                            path: 'inOrders',
                            populate: 'menuItem'
                        }}]);
    if(orders == undefined) orders = [];
    res.status(200).json({success: true, data: orders});
});

// @desc      Create Order Status
// @route     POST /api/v1/orders/:id/status
// @access    Private
exports.createOrderStatus = asyncHandler( async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if(!order)
        return next(
            new CustomError(`Order not found with id of ${req.params.id}`, 404)
          );
    
    const status = req.body.status;
    
    req.body.order = req.params.id;
    // TODO: move these controls to a middleware;
    // Customers only able to change 'canceled by customer' or 'ordered'
    if(status == 'canceled by customer' || status == 'ordered' || status == 'scheculed'){
        if(req.user.role != 'customer' && req.user.role != 'admin')
            return next(
                new CustomError(`Access Denied`, 401)
            );
        if(req.user.customer && req.user.customer._id != order.customer)
            return next(
                new CustomError(`Access Denied`, 401)
            );
    }
    // Companies only able to change 'canceled by company' or 'prepared'
    if(status == 'canceled by company' || status == 'prepared' || status == 'accepted by company'){
        if(req.user.role != 'company' && req.user.role != 'admin')
            return next(
                new CustomError(`Access Denied`, 401)
            );
        if(req.user.company && req.user.company._id != order.company)
            return next(
                new CustomError(`Access Denied`, 401)
            );
    }
    // Drivers only able to change 'delivered' or 'driver picked up'
    if(status == 'delivered' || status == 'driver picked up'){
        if(req.user.role != 'driver' && req.user.role != 'admin')
            return next(
                new CustomError(`Access Denied`, 401)
            );
        // TODO: Check from ride if this driver delivering
       /*  if(req.user.driver && req.user.driver._id != ride.driver)
            return next(
                new CustomError(`Access Denied`, 401)
            ); */
    }
    // Check the role is not equal to 'canceled by system' 
    if(status == 'canceled by system'){
        if(req.user.role != 'driver' && req.user.role != 'admin')
            return next(
                new CustomError(`Access Denied`, 401)
            );
    }

    const orderStatus = await OrderStatus.create(req.body);

    console.log(orderStatus);
    res.status(200).json({success:true, data: orderStatus});
});
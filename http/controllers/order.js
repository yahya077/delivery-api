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

    const status = req.query.status;
    
    let orders = await Order.find({company: company._id})
                        .populate([{path:'orderStatuses', match: doc => (status != undefined ? {status} : {})},
                        {path: 'basket',
                            populate: {
                            path: 'inOrders',
                            populate: 'menuItem'
                        }}]).
                        exec().then((result)=>{
                            if(status != undefined){
                                let filtered = result.filter(function(order, index, arr){ 
                                    return order.orderStatuses && order.orderStatuses.status == status;
                                });
                                return filtered;
                            }
                            return result;
                        });                        
    if(orders == undefined) orders = [];
    res.status(200).json({success: true, data: orders});
});

// @desc      Get Customer Orders
// @route     POST /api/v1/customers/:customerId/orders/customer
// @access    Private
exports.getCustomerOrders = asyncHandler( async (req, res, next) => {
    const customer = await Customer.findById(req.params.customerId);

    const status = req.query.status;

    let orders = await Order.find({customer: customer._id})
                        .populate([{path:'orderStatuses', match: doc => ({status})},
                        {path: 'basket',
                            populate: {
                            path: 'inOrders',
                            populate: 'menuItem'
                        }}]).
                        exec().then((result)=>{
                            if(status != undefined){
                                let filtered = result.filter(function(order, index, arr){ 
                                    return order.orderStatuses && order.orderStatuses.status == status;
                                });
                                return filtered;
                            }
                            return result;
                        });
    if(orders == undefined) orders = [];
    res.status(200).json({success: true, data: orders});
});
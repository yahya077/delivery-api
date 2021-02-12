const CustomError = require('../helpers/customError');
const asyncHandler = require('../middlewares/async');
const Basket = require('../models/Basket');
const Customer = require('../models/Customer');
const InOrder = require('../models/InOrder');
const MenuItem = require('../models/MenuItem');

// @desc      Get customer baskets
// @route     GET /api/v1/customers/:customerId/baskets
// @access    Private
exports.getCustomerBaskets = asyncHandler( async (req, res, next) => {
    const baskets = await Basket.find({customer: req.params.customerId})
                        .populate({path:'inOrders', populate: 'menuItem'});
    res.status(200).json({ success: true, data: baskets });
});

// @desc      Add Item To Basket
// @route     POST /api/v1/customers/:customerId/baskets/addItem
// @access    Private
exports.addItemToBasket = asyncHandler( async (req, res, next) => {
    const customer = Customer.findById(req.params.customerId);
    if(req.user.role != 'admin' && customer.user != req.user.id){
        return next(
            new CustomError(`Access Denied`, 401)
        );
    }
    
    const menuItem = await MenuItem.findById(req.body.menuItem);
    if (!menuItem) {
        return next(
            new CustomError(`Menu item not found with id of ${req.body.menuItem}`, 404)
          );
    }

    let basket = await Basket.findOne({ customer: req.params.customerId ,company:menuItem.company});

    if (!basket) {
        basket = await Basket.create({
            customer: req.params.customerId,
            company: menuItem.company
        });
    }

    const removedIngredients = req.body.removedIngredients;
    const price = {
        display: menuItem.price.display * req.body.quantity,
        currency: menuItem.price.currency 
    }
    
    let checkIfExist = await InOrder.findOne({ basket: basket._id, menuItem: menuItem._id, removedIngredients });

    let inOrder;
    if(checkIfExist){
        price.display = price.display + checkIfExist.price.display;
        console.log(price);
        const newQuantity = req.body.quantity + checkIfExist.quantity;
        console.log(newQuantity);

        inOrder = await InOrder.findByIdAndUpdate(checkIfExist._id, {price,quantity:newQuantity} ,{ 
            new: true,
            runValidators: true
         });
        checkIfExist = await InOrder.findOne({ basket: basket._id, menuItem: menuItem._id, removedIngredients });
        return res.status(200).json({ success: true, data: checkIfExist });
    }

    inOrder = await InOrder.create({
        basket: basket._id,
        menuItem: menuItem._id,
        quantity: req.body.quantity,
        price,
        removedIngredients
    });
    res.status(200).json({ success: true, data: inOrder });
});

// @desc      Remove Item From Basket
// @route     Delete /api/v1/customers/:customerId/baskets/remove-item
// @access    Private
exports.removeItemFromBasket = asyncHandler( async (req, res, next) => {
    const customer = Customer.findById(req.params.customerId);

    if(req.user.role != 'admin' && customer.user != req.user.id){
        return next(
            new CustomError(`Access Denied`, 401)
        );
    }
    console.log(req.body.inOrderId);
    await InOrder.findByIdAndRemove(req.body.inOrderId);

    res.status(200).json({ success: true, data: [] });
});
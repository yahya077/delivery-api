const CustomError = require('../helpers/customError');
const asyncHandler = require('../middlewares/async');
const Basket = require('../models/Basket');
const Customer = require('../models/Customer');
const InOrder = require('../models/InOrder');
const MenuItem = require('../models/MenuItem');

// @desc      Get customer basket
// @route     GET /api/v1/customers/:customerId/baskets
// @access    Private
exports.getCustomerBaskets = asyncHandler( async (req, res, next) => {
    console.log(req.params.customerId);
    let basket = await Basket.findOne({customer: req.params.customerId, status:'active'})
                        .populate({path:'inOrders', populate: 'menuItem'});
    if(!basket) basket = []
    
    res.status(200).json({ success: true, data: basket });
});

// @desc      Get Basket By Basket Id
// @route     GET /api/v1/customers/:customerId/baskets/:id
// @access    Private
exports.getCustomerBasket = asyncHandler( async (req, res, next) => {
    const basket = await Basket.findOne({_id: req.params.id, status:'active'})
                        .populate({path:'inOrders', populate: 'menuItem'});
    if(!basket){
        return next(
            new CustomError(`Basket not found with id of ${req.params.id}`, 404)
          );
    }
    res.status(200).json({ success: true, data: basket });
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

    let basket = await Basket.findOne({ customer: req.params.customerId});

    if(basket && basket.company.toString() !== menuItem.company.toString()){
        await basket.remove();
        basket = await Basket.create({
            customer: req.params.customerId,
            company: menuItem.company
        });
    }
    if (!basket) {
        console.log("asdhasd");
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
    console.log(checkIfExist);
    if(checkIfExist){
        price.display = price.display + checkIfExist.price.display;

        const newQuantity = req.body.quantity + checkIfExist.quantity;

        inOrder = await InOrder.findByIdAndUpdate(checkIfExist._id, {price,quantity:newQuantity} ,{ 
            new: true,
            runValidators: true
         });
        checkIfExist = await InOrder.findOne({ basket: basket._id, menuItem: menuItem._id, removedIngredients });
        return res.status(200).json({ success: true, data: checkIfExist });
    }
    console.log("out order");
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
    
    await InOrder.findByIdAndRemove(req.body.inOrderId);

    res.status(200).json({ success: true, data: [] });
});

// @desc      Update Item From Basket
// @route     Put /api/v1/customers/:customerId/baskets/update-item
// @access    Private
exports.updateItemFromBasket = asyncHandler( async (req, res, next) => {
    const customer = Customer.findById(req.params.customerId);

    if(req.user.role != 'admin' && customer.user != req.user.id){
        return next(
            new CustomError(`Access Denied`, 401)
        );
    }

    let inOrder = await InOrder.findById(req.body.inOrderId).populate('menuItem');
    
    if (!inOrder) {
        return next(
          new CustomError(`In Order not found with id of ${req.body.inOrderId}`, 404)
        );
    }

    const quantity = req.body.quantity;
    
    if(quantity == 0 ){
        await InOrder.findByIdAndRemove(req.body.inOrderId);

        return res.status(200).json({ success: true, data: [] });
    }
    
    req.body.price = {
        display: (inOrder.menuItem.price.display * req.body.quantity).toFixed(2),
        currency: inOrder.menuItem.price.currency 
    }

    inOrder = await InOrder.findOneAndUpdate(req.body.inOrderId, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: inOrder });
});
const CustomError = require('../helpers/customError');
const asyncHandler = require('../middlewares/async');
const MenuItem = require('../models/MenuItem');

// @desc      Get menu items
// @route     GET /api/v1/menu-items
// @route     GET /api/v1/companies/:companyId/menu-items
// @access    Public
exports.getMenuItems = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc      Get single menu item
// @route     GET /api/v1/menu-items/:id
// @access    Public
exports.getMenuItem = asyncHandler(async (req, res, next) => {
    const menuItem = await MenuItem.findById(req.params.id);
  
    if (!menuItem) {
      return next(
        new CustomError(`Menu item not found with id of ${req.params.id}`, 404)
      );
    }
  
    res.status(200).json({ success: true, data: menuItem });
});

// @desc      Create new menu item
// @route     POST /api/v1/menu-items
// @access    Private
exports.createMenuItem = asyncHandler(async (req, res, next) => {
    const price = {
      display: req.body.display,
      currency: req.body.currency
    };
    req.body.price = price;
    const menuItem = await MenuItem.create(req.body);
  
    res.status(201).json({
      success: true,
      data: menuItem
    });
});

// @desc      Update menu item
// @route     PUT /api/v1/menu-items/:id
// @access    Private
exports.updateMenuItem = asyncHandler(async (req, res, next) => {
    let menuItem = await MenuItem.findById(req.params.id);
  
    if (!menuItem) {
      return next(
        new CustomError(`Menu item not found with id of ${req.params.id}`, 404)
      );
    }
  
    menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
  
    res.status(200).json({ success: true, data: menuItem });
});
  

// @desc      Delete menu item
// @route     DELETE /api/v1/menu-items/:id
// @access    Private
exports.deleteMenuItem = asyncHandler(async (req, res, next) => {
    const menuItem = await MenuItem.findById(req.params.id);
  
    await menuItem.remove();
  
    res.status(200).json({ success: true, data: {} });
});
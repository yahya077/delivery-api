const geocoder = require('../../utils/geocoder');
const CustomError = require('../helpers/customError');

const advancedResults = (model, populate, byFilter) => async (req, res, next) => {
    let query;
  
    // Copy req.query
    const reqQuery = { ...req.query };
    
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
  
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
  
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
  
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource   
    query = model.find(JSON.parse(queryStr));

    if(req.query.category){
      var ObjectID = require('mongodb').ObjectID;
      if(!ObjectID.isValid(req.query.category))
          return next(new CustomError(`Bootcamp not found with id of ${req.query.category}`, 404))
    }

    if (populate) {
      query = query.populate(populate);
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
  
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
  
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let total;
    if(req.params.zipcode){
      const { zipcode, distance } = req.params;

      // Get lat/lng from geocoder
      const loc = await geocoder.geocode(zipcode);
      const lat = loc[0].latitude;
      const lng = loc[0].longitude;

      // Calc radius using radians
      // Divide dist by radius of Earth
      // Earth Radius = 3,963 mi / 6,378 km
      const radius = distance / 6.378;
      const q = JSON.parse(queryStr);
      total = await model.countDocuments({location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }});

      query = query
                .find({location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }})
                .skip(startIndex)
                .limit(limit);
    }else if(req.params.id){
      if(byFilter = 'company'){
      total = await model.countDocuments({company: req.params.id});
      query = query
      .find({company: req.params.id})
      .skip(startIndex)
      .limit(limit);
      }
    }else{
      total = await model.countDocuments(JSON.parse(queryStr));

      query = query.skip(startIndex).limit(limit);
    }
  
    // Executing query
    const results = await query;
    // Pagination result
    const pagination = {};
  
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
  
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
  
    res.advancedResults = {
      success: true,
      count: results.length,
      pagination,
      data: results
    };
  
    next();
  };
  
  module.exports = advancedResults;
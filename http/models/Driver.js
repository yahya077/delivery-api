const mongoose = require('mongoose');
const geocoder = require('../../utils/geocoder');

const DriverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        minlength: [5, 'Name must be at least 5 characters'],
        maxlength: [40, 'Name can not be more than 40 characters']
    },
    phone: {
        type: String,
        maxlength: [10, 'Phone number can not be longer than 10 characters']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Invalid user'],
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    location: {
        // GeoJSON Point
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: {
          type: [Number],
          index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'drivers',
    timestamps: true
});


// Geocode & create location field
DriverSchema.pre('save', async function(next) {
    const loc = await geocoder.geocode(this.address);
    this.location = {
      type: 'Point',
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedAddress: loc[0].formattedAddress,
      street: loc[0].streetName,
      city: loc[0].city,
      state: loc[0].stateCode,
      zipcode: loc[0].zipcode,
      country: loc[0].countryCode
    };
  
    // Do not save address in DB
    this.address = undefined;
    next();
  });

module.exports = mongoose.model('Driver', DriverSchema);

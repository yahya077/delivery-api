const mongoose = require('mongoose');
const geocoder = require('../../utils/geocoder');

const AddressSchema= new mongoose.Schema({
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    type: {
        type: String,
        enum: ['Home', 'Office', 'Diger'],
        required: [true, 'Please select a type'],
    },
    customer: {
        type: mongoose.Schema.ObjectId,
        ref: 'Customer',
        required: true
    },
    description: {
        type: String,
        required: [true, 'Please add an address description']
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
    phone: {
        type: String,
        maxlength: [10, 'Phone number can not be longer than 10 characters']
    },
},
{
    collection: 'addresses',
    timestamps: true
}
);

// Geocode & create location field
AddressSchema.pre('save', async function(next) {
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

module.exports = mongoose.model('Address', AddressSchema);

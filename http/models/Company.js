const mongoose = require('mongoose');
const geocoder = require('../../utils/geocoder');


const CompanySchema = new mongoose.Schema({
    brandName: {
        type: String,
        required: true,
        min: [2, 'Brand name must be at least 2'],
        maxlength: [20, 'Brand name can not be longer than 20 characters']
    },
    logo: {
        type: String,
        default: 'uploads/images/no-logo.jpg'
    },
    phone: {
        type: String,
        maxlength: [10, 'Phone number can not be longer than 10 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    addressDescription: {
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
    type: {
        // Array of strings
        type: [String],
        required: true,
        enum: [
          'Fast&Food',
          'Turkish Kitchen',
          'Soup',
          'Pizza',
          'Kebab',
          'Chinese',
          'American',
          'Vegan Restaurant'
        ]
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must can not be more than 10']
    },
    coverImage: {
        type: String,
        default: 'uploads/images/no-image.jpg'
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'companies',
    timestamps: true
  }
);

// Geocode & create location field
CompanySchema.pre('save', async function(next) {
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

module.exports = mongoose.model('Company', CompanySchema);

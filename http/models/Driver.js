const mongoose = require('mongoose');

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
    status: {
        type: String,
        enum: ['Online', 'Offline']
    }
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'drivers',
    timestamps: true
});

module.exports = mongoose.model('Driver', DriverSchema);

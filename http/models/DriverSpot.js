const mongoose = require('mongoose');

const DriverSpotSchema = new mongoose.Schema({

    driver: {
        type: mongoose.Schema.ObjectId,
        ref: 'Driver',
        required: [true, 'Invalid driver'],
    },
    coordinates: {
        type: [Number],
        index: '2dsphere'
    },
    status: {
        type: String,
        enum: ['Available', 'On Delivery', 'Disable']
    }
},{
    collection: 'driverSpots',
    timestamps: true
});

module.exports = mongoose.model('DriverSpots', DriverSpotSchema);
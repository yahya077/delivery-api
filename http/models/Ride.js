const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
    order:{
        type: mongoose.Schema.ObjectId,
        ref:'Order'
    },
    driver:{
        type: mongoose.Schema.ObjectId,
        ref:'Driver'
    },
    acceptedTime:{
        type:Date
    },
    pickUpTime:{
        type:Date
    },
    deliveryTime:{
        type:Date
    },
    address:{
        phone: {
            type: String,
            maxlength: [10, 'Phone number can not be longer than 10 characters']
        },
        description:{
            type:String,
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
    },
    price: {
        display: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            required: true,
            default: 'tl'
        }
    }
},{
    timestamps: true,
    collection: "rides",
});

module.exports = mongoose.model('Ride', RideSchema);

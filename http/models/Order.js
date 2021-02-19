const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    basket:{
        type: mongoose.Schema.ObjectId,
        ref: 'Basket',
        required: [true, 'Basket required'],
    },
    company:{
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        required: [true, 'Company required'],
    },
    customer:{
        type: mongoose.Schema.ObjectId,
        ref: 'Customer',
        required: [true, 'Customer required'],
    },
    estimatedDeliveryDate:{
        type: Date
    },
    foodReady:{
        type:Date
    },
    actualDeliveryTime:{
        type:Date
    },
    scheculedDate:{
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
    },
    deliveryMethod: {
        type:String,
        enum: ['Pick Up', 'Driver', 'Company']
    }
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
    collection: "orders",
}
);

// Reverse populate with virtuals
OrderSchema.virtual('orderStatuses', {
    ref: 'OrderStatus',
    localField: '_id',
    foreignField: 'order',
    justOne: false,
    
});

module.exports = mongoose.model('Order', OrderSchema);

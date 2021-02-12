const mongoose = require('mongoose');

const BasketSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.ObjectId,
        ref: 'Customer',
        required: true
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'ordered','deleted'],
        default: 'active',
    }
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'baskets',
    timestamps: true
});

// Reverse populate with virtuals
BasketSchema.virtual('inOrders', {
    ref: 'InOrder',
    localField: '_id',
    foreignField: 'basket',
    justOne: false
  });

module.exports = mongoose.model('Basket', BasketSchema);
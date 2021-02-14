const mongoose = require('mongoose');

const OrderStatusSchema = mongoose.Schema({
    order:{
        type: mongoose.Schema.ObjectId,
        ref: 'Order',
        required: [true, 'Order required'],
    },
    status: {
        type: String,
        enum: ['ordered', 'scheculed','canceled by company', 'canceled by customer', 'driver picked up', 'canceled by system'],
        default: 'ordered',
    },
    reason: {
        type:String
    }
},{
    timestamps: true,
    collection: "orderStatuses",
});

module.exports = mongoose.model('OrderStatus', OrderStatusSchema);

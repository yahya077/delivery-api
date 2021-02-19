const mongoose = require('mongoose');

const OrderStatusSchema = mongoose.Schema({
    order:{
        type: mongoose.Schema.ObjectId,
        ref: 'Order',
        required: [true, 'Order required'],
    },
    status: {
        type: String,
        enum: ['ordered', 'prepared', 'scheculed','canceled by company', 'canceled by customer', 'driver picked up', 'canceled by system', 'delivered', 'accepted by company'],
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

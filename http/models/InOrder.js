const mongoose = require('mongoose');

const InOrderSchema = new mongoose.Schema({
    basket: {
        type: mongoose.Schema.ObjectId,
        ref: 'Basket',
        required: true,
    },
    menuItem: {
        type: mongoose.Schema.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity required'],
        min: [1, 'Minimun quantity is one']
    },
    price: {
        display : {
            type: Number
        },
        currency : {
            type: String
        }
    },
    removedIngredients: {
        type: [String],
    } 
},{ collection:'inOrders', timestamps:true });

module.exports = mongoose.model('InOrder', InOrderSchema);
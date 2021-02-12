const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
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
    }
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'customers',
    timestamps: true
});

// Reverse populate with virtuals
CustomerSchema.virtual('addresses', {
    ref: 'Address',
    localField: '_id',
    foreignField: 'customer',
    justOne: false
  });


module.exports = mongoose.model('Customer', CustomerSchema);

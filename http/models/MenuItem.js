const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        minlength: [4, 'Name must be at least 4 characters'],
        maxlength: [40, 'Name can not be more than 30 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        trim: true,
        minlength: [5, 'Description must be at least 5 characters'],
        maxlength: [540, 'Description can not be more than 540 characters']
    },
    menuName: {
        type: String,
        required: [true, 'Please add a menu name'],
        minlength: [4, 'Menu name must be at least 4 characters'],
        maxlength: [30, 'Menu name can not be more than 30 characters']
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: [true, 'Please add a category'],
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        required: [true, 'Company required'],
    },
    ingredients: {
        type: [String],
        minlength: [4, 'Ingredient must be at least 4 characters'],
        maxlength: [10, 'Ingredient can not be more than 30 characters']
    },
    price: {
        display : {
            type: Number,
            required: true
        },
        currency : {
            type: String
        }
    },
    image: {
        type: String,
        default: 'uploads/images/no-image.jpg'
    }

}, { collection:'menuItems', timestamps:true });

module.exports = mongoose.model('MenuItem', MenuItemSchema);

const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        minlength: [5, 'Name must be at least 5 characters'],
        maxlength: [40, 'Name can not be more than 40 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        trim: true,
        minlength: [5, 'Name must be at least 5 characters'],
        maxlength: [240, 'Name can not be more than 240 characters']
    },
    mobileIcon: {
        type: String,
        trim: true
    },
    webIcon: {
        type: String,
        trim: true
    },
    coverImage: {
        type: String,
        default: 'uploads/images/no-image.jpg'
    }
}, { collection:'categories', timestamps:true });

module.exports = mongoose.model('Category', CategorySchema);

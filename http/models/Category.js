const mongoose = require('mongoose');
const slugify = require('slugify');

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
        minlength: [5, 'Description must be at least 5 characters'],
        maxlength: [240, 'Description can not be more than 240 characters']
    },
    slug: String,
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

// Get category by slug
CategorySchema.statics.getCategoryBySlug = async function(slug){
    try {
        const category = await this.finn({ slug: { $in: slug } });
        return category;
    } catch (error) {
        throw error;
    }
}

// Create category slug from the name
CategorySchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

module.exports = mongoose.model('Category', CategorySchema);

const mongoose = require("mongoose");
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'Not more than 40 characters'],
        minlength: [2, 'Not less than 2 characters']
        // validate: [validator.isAlpha, 'Only letters for name']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'Must have duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'Must have maxGroupSize']
    },
    difficulty: {
        type: String,
        required: [true, 'Must have difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is easy, medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Min ratingAverage 1'],
        max: [5, 'Max ratingAvg 5']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    priceDiscount: {
        type: Number,
        validate: {
            //also can use validator library
            //this only points to current document on NEW document creation
            validator: function (val) {
                return val < this.price;
            },
            message: 'Price discount ({VALUE}) to be less than price'
        }
    },
    summary: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Tour must have a price']
    },
    description: {
        type: String,
        trim: true
        // required: [true, 'Must have a description']
    },
    imageCover: {
        type: String,
        required: [true, 'Must have a image cover']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false //not showing to the client
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        //GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number], //array of numbers
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number], //array of numbers
            address: String,
            description: String,
            day: Number
        },
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

//DOCUMENT MIDDLEWARE: runs before .save() adn .create(). Using slugify package
tourSchema.pre('save', function (next) {
    // console.log(this); // this points to the document which we work on
    //add slug to the schema first then below code
    this.slug = slugify(this.name, { lower: true });
    next();
});

// tourSchema.pre('save', function (next) {
//     console.log('Will save document');
//     next();
// })
//
// //post middleware
// tourSchema.post('save', function(doc, next) {
//     console.log(doc);
//     next();
// })

//QUERY MIDDLEWARE for example before Tour.find() /^find/ will find all queruies starting from find
tourSchema.pre(/^find/, function(next) {
// tourSchema.pre('find', function(next) {
    this.find({ secretTour: { $ne: true } }); // find all tours where secret tour is not true

    this.start = Date.now();
    next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
})

// tourSchema.pre('save', async function(next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });

tourSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} miliseconds!`);
    // console.log(docs);
    next();
})


//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    // console.log(this.pipeline());
    next();
})

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
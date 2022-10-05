const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tour must have a name'],
        unique: true,
        trim: true
    },
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
        required: [true, 'Must have difficulty']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    priceDiscount: Number,
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
        trim: true,
        required: [true, 'Must have a description']
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
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
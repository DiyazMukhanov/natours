const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');



exports.setTourUserIds = (req, res, next) => {
    if(!req.body.tour) req.body.tour = req.params.tourId; //will be found in url
    if(!req.body.user) req.body.user = req.user.id; // we will have it from the protect middleware
    next();
}

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
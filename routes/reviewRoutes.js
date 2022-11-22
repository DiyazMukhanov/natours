const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

//POST /tour/234dsfdfsdf/reviews - create review on a certain tour
//GET /tour/dsfds3424324/reviews - get reviews from the certain tour

router.route('/')
    .get(reviewController.getAllReviews)
    .post(authController.protect, authController.restrictTo('user'), reviewController.createReview);

module.exports = router;
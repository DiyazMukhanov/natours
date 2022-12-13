const Tour = require('../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
// const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

exports.getAllTours = factory.getAll(Tour);
//127.0.0.1:3000/api/v1/tours?duration[gte]=10&sort=price
exports.getTour = factory.getOne(Tour, { path: 'reviews'});
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);




// exports.updateTour = catchAsync(async (req, res, next) => {
//         const tour = await Tour.findByIdAndUpdate(req.params.id,req.body,{
//             new:true,
//             runValidators:true
//         });
//
//         if(!tour) {
//             return next(new AppError('No tour found with that ID', 404));
//         }
//
//         res.status(200).json({
//             status:'success',
//             data:{
//                 tour
//             }
//         });
// });

exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//         const tour = await Tour.findByIdAndDelete(req.params.id);
//
//         if(!tour) {
//             return next(new AppError('No tour found with that ID', 404));
//         }
//
//         res.status(200).json({
//             status:'deleted'
//         });
// });

//AGGREGATION PIPELINE
exports.getTourStats = catchAsync(async (req, res, next) => {
        //stages in array
      const stats = await Tour.aggregate([
          {
              $match: { ratingsAverage: { $gte: 4.5 } }
          },
          {
              $group: {
                  _id: '$difficulty', //grouping by difficulties
                  numTours: { $sum: 1 },
                  numRatings: { $sum: '$ratingsQuantity' },
                  avgRating: { $avg: '$ratingsAverage' },
                  avgPrice: { $avg: '$price' },
                  minPrice: { $min: '$price' },
                  maxPrice: { $max: '$price' }
              }
          },
          { $sort: { avgPrice: 1 }
          } //1 for ascending
          // { $match: { _id: { $ne: 'easy' } } }
      ]);

        res.status(200).json({
            status:'success',
            data: {
                stats
            }
        });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
       const year = req.params.year * 1; //2021

       const plan = await Tour.aggregate([
           {
               $unwind: '$startDates' //breaking one tour to three by starting dates
           },
           {
               $match: {
                   startDates: {
                       $gte: new Date(`${year}-01-01`),
                       $lte: new Date(`${year}-12-31`)
                   }
               }
           },
           {
               $group: {
                   _id: { $month: '$startDates' },
                   numTourStarts: { $sum: 1 },
                   tours: { $push: '$name' }
               }
           },
           {
               $addFields: { month: '$_id' }
           },
           {
               $project: {
                   _id: 0 // 1 is to show
               }
           },
           {
               $sort: { numTourStarts: -1 } //starting from highest number
           },
           {
               $limit: 6
           }
       ]);

       res.status(200).json({
           status:'success',
           results: plan.length,
           data: {
               plan
           }
       });
});


//BUILD THE QUERY
// //1) FILTERING
// const queryObj = {...req.query} //by this we create a new obj and not referencing only
// //Excluding fields from query because we dont have a tour with page etc
// const excludedFields = ['page', 'sort', 'limit', 'fields'];
// excludedFields.forEach(el => delete queryObj[el]); //forEach we don't create new Arr. Only modifying. We are cleaning queyObj from fields
//
// // console.log(req.query, queryObj);
//
// // const tours = await Tour.find({
// //     duration: 5,
// //     difficulty: 'easy'
// // });
// //same below
//
// //2) ADVANCED FILTERING - just do it)
// console.log(req.query); //{ difficulty: 'easy', duration: { gte: '5' } } if 127.0.0.1:3000/api/v1/tours?duration[gte]=5&difficulty=easy
// // but we need {difficulty: 'easy', duration: {$gte: 5   }} with $
//
// let queryStr = JSON.stringify(queryObj);
// queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
// console.log(JSON.parse(queryStr));
//
//
// let query = Tour.find(JSON.parse(queryStr)); // the find method returns the mangoose Query object and this gives us to chain methods

// //3) SORTING
// //127.0.0.1:3000/api/v1/tours?sort=-price,-ratingsAverage
// if(req.query.sort) {
//     const sortBy = req.query.sort.split(',').join(' ');
//     //{ sort: '-price,-ratingsAverage' } but mongoose requires string separated by spaces sort: '-price -ratingsAverage'
//     console.log(sortBy)
//     query = query.sort(sortBy);
// } else {
//     query = query.sort('-createdAt');
// }

// //4) FIELD LIMITING
// //127.0.0.1:3000/api/v1/tours?fields=name,duration,difficulty,price
// if(req.query.fields) {
//     const fields = req.query.fields.split(',').join(' ');
//     query = query.select(fields);
//     // query = query.select('name duration difficulty price')
// } else {
//     query = query.select('-__v'); //exclude __v from the response which is included by mongoose
// }

// //5) PAGINATION
// // 127.0.0.1:3000/api/v1/tours?page=2&limit=10
// //Let's code default values for pagination first below
// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 10;
// const skip = (page - 1) * limit;
// query = query.skip(skip).limit(limit); //skip first 10 results and give starting from 11
//
// if(req.query.page) {
//     const numTours = await Tour.countDocuments();
//     if(skip >= numTours) throw new Error('This page does not exist');
// }

//6)
//127.0.0.1:3000/api/v1/tours?limit=5&sort=-ratingsAverage,price - getting 5 results and sorting by ratings and price

//EXECUTE THE QUERY
//     const features = new APIFeatures(Tour.find(), req.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .paginate(0)
//     const tours = await features.query;
//
//     //SEND RESPONSE
//     res.status(200).json({
//         status: 'success',
//         results: tours.length,
//         data: {
//             tours
//         }
//     })
// } catch (err) {
//     res.status(404).json({
//         status: 'fail',
//         message: err
//     })
// }


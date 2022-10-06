const Tour = require('../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}


exports.getAllTours = async (req, res) => {
    try{
        const features = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate(0)
        const tours = await features.query;

        //SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }

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
};

exports.getTour = async (req, res) => {
   try{
       const tour = await Tour.findById(req.params.id)
       //Tour.findOne({ _id: req.params.id })

       res.status(200).json({
           status: 'success',
           data: {
               tour
           }
       });
   }catch(err){
       res.status(404).json({
           status: 'fail',
           message: err
       })
   }
}

exports.createTour = async (req, res) => {
    try{
        const newTour = await Tour.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    };
};

exports.updateTour = async (req, res) => {
    try{
        const tour = await Tour.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });
        res.status(200).json({
            status:'success',
            data:{
                tour
            }
        });
    }
    catch(err){
        res.status(404).json({
            status:'fail',
            message:err
        });
    }
};

exports.deleteTour = async (req, res) => {
    try{
        const tour = await Tour.findByIdAndDelete(req.params.id);
        res.status(200).json({
            status:'deleted'
        });
    } catch(err) {
        res.status(404).json({
            status:'fail',
            message:err
        });
    }

}
const AppError = require('./../utils/appError');

//This what we get in POSTMAN if searching the tour with wrong id
//"error": {
//         "stringValue": "\"wwwwwww\"",
//         "valueType": "string",
//         "kind": "ObjectId",
//         "value": "wwwwwww",
//         "path": "_id",
//         "reason": {},
//         "name": "CastError",
//         "message": "Cast to ObjectId failed for value \"wwwwwww\" (type string) at path \"_id\" for model \"Tour\""
//     }

//This what we get in postman if duplicate value
//"status": "error",
//     "error": {
//         "driver": true,
//         "name": "MongoError",
//         "index": 0,
//         "code": 11000,
//         "keyPattern": {
//             "name": 1
//         },
//         "keyValue": {
//             "name": "The Forest Hiker"
//         },
//         "statusCode": 500,
//         "status": "error"
//     },

//This what we get in postman in case of wrong update values. Mongoose validation errors
//"error": {
//         "errors": {
//             "difficulty": {
//                 "name": "ValidatorError",
//                 "message": "Difficulty is easy, medium or difficult",
//                 "properties": {
//                     "message": "Difficulty is easy, medium or difficult",
//                     "type": "enum",
//                     "enumValues": [
//                         "easy",
//                         "medium",
//                         "difficult"
//                     ],
//                     "path": "difficulty",
//                     "value": "prpfdsfsd"
//                 },
//                 "kind": "enum",
//                 "path": "difficulty",
//                 "value": "prpfdsfsd"
//             },
//             "ratingsAverage": {
//                 "name": "ValidatorError",
//                 "message": "Max ratingAvg 5",
//                 "properties": {
//                     "message": "Max ratingAvg 5",
//                     "type": "max",
//                     "max": 5,
//                     "path": "ratingsAverage",
//                     "value": 8
//                 },
//                 "kind": "max",
//                 "path": "ratingsAverage",
//                 "value": 8
//             }
//         },

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const value = Object.values(err.keyValue)[0]; //Object.values is to work with object like with array
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message); //we will get array of values
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token. Please login again', 401);

const handleJWTExpiredError = () => new AppError('Expired token!', 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    //Operational error, send message to the client
    if(err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
        // Programming or other unknown errors, don't leak error details to the client
    } else {
        // 1) Log error
        console.error('ERROR', err);

        // 2)Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        })
    }
}


module.exports = (err, req, res, next) => {
    // console.log(err.stack);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
        // console.log(err);
    } else if (process.env.NODE_ENV === 'production') {
        //name of error CastError in case of getting tour with wrong id
        let error = Object.create(err);

        if(err.name === 'CastError') error = handleCastErrorDB(error);
        if(err.code === 11000)  error = handleDuplicateFieldsDB(error);
        if(err.name === 'ValidationError') error = handleValidationErrorDB(error);
        if(err.name === 'JsonWebTokenError') error = handleJWTError();
        if(err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};
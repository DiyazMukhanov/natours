const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');


const app = express();

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

// 1)Global Middlewares

//Set security http headers
app.use(helmet())

//Development logging
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//defining how many requests from ip we can receive in time window (1 hour)
//but if required more, increase
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP'
});
app.use('/api', limiter);

//Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb'}));

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization againt cross side scripting attacks
app.use(xss());

//Prevent parameter pollution. In options we show where we allow duplicating in the query string. In otehr cases it will not allow.
//for example it will not allow ?sort=duration&sort=price, but it will allow ?duration=9&duration=5
app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));

//Serving static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.headers);

    // console.log(`The request was done on ${req.requestTime}`);
    next();
})

// 2) Route handlers


// 3) routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);

//Unknown route handler
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Error handling middleware
app.use(globalErrorHandler);

// 4) Start server
module.exports = app;


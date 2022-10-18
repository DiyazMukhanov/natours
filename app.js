const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');


const app = express();

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// 1) Middlewares
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));


// app.use((req, res, next) => {
//     console.log('Hello from middleware');
//     next();
// });

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

//Unknown route handler
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Error handling middleware
app.use(globalErrorHandler);

// 4) Start server
module.exports = app;
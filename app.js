const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const app = express();

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// 1) Middlewares
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));


app.use((req, res, next) => {
    console.log('Hello from middleware');
    next();
});

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(`The request was done on ${req.requestTime}`);
    next();
})

// 2) Route handlers


// 3) routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);



// 4) Start server
module.exports = app;
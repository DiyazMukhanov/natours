const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });
});

exports.login = catchAsync(async (req, res, next) => {
       const { email, password } = req.body; //extracting req.body.email via destructuring

      // 1) Check if email and password exist
       if(!email || !password) {
          return next(new AppError('Please provide email and password!', 400));
       }
      // 2) Check if user exists and password is correct
       const user = await User.findOne({ email }).select('+password');  //{ email: email } .select('+password') - to show password which is not normally shown

       // console.log(user);

       if(!user || !await user.correctPassword(password, user.password)) {
           return next(new AppError('Incorrect email or password', 401))
       }

      // 3) Send token to the client if everything is ok
       const token = signToken(user._id);
       res.status(200).json({
           status: 'success',
           token
       });
});

exports.protect = catchAsync(async(req, res, next) => {
  // 1)   Getting token and check if it's there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1] //  { authorization: 'Bearer fddsfdsfgdgsdfgsdf' }
   }
    // console.log(token);

    if(!token) {
        return next(new AppError('You are not logged in!', 401));
    }
  // 2)   Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //verified token
    // console.log(decoded);
  // 3)   Check if user still exists
    const freshUser = await User.findById(decoded.id);
    if(!freshUser) {
        return next(new AppError('The user does not exist!', 401));
    }
  // 4)   Check if user changed password after token was issued
   if(freshUser.changedPasswordAfter(decoded.iat)) {
       return next(new AppError('User recently chnaged password! Please login again', 401));
   }

  //GRANT ACCESS TO PROTECTED ROUTE
    req.user = freshUser;
    next();
});

//(...roles) will create an array of all roles for example ['admin', 'lead-guide']
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission', 403));
        }

        next();
    }
}

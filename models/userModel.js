const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
   name: {
       type: String,
       required: [true, 'Please tell us your name!']
   },
   email: {
       type: String,
       required: [true, 'Please provide your email!'],
       unique: true,
       lowercase: true,
       validate: [validator.isEmail, 'Please provide a valid email']
   },
   photo: String,
   password: {
       type: String,
       required: [true, 'Please provide a password!'],
       minlength: 8,
       select: false //will never show up in output
   },
   passwordConfirm: {
       type: String,
       required: [true, 'Please confirm your password!'],
       validate: {
           // This only works on CREATE and SAVE. not find and update etc
           validator: function(el) {
             return el === this.password;
           },
           message: 'Passwords are not the same!'
       }
   },
   passwordChangedAt: Date
});

//Encrypting the password
userSchema.pre('save', async function(next) {
    //this word points to current document (current user)

    //Only run this function if password was modified
    if(!this.isModified('password')) return next();

    //Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12); //12 is CPU intensity for hashing. By default, is 10. hash is asynchronous

    //Delete the passwordConfirm field from the model
    this.passwordConfirm = undefined; //because we don't want to save this in DB. Only using for confirmation
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        console.log(changedTimestamp, JWTTimestamp);
        return JWTTimestamp < changedTimestamp;
    }

    //False means not changed
    return false;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
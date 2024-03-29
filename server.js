const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on("uncaughtException", err => {
    console.log('UNCAUGHT EXCEPTION! Shutting down');
    console.log(err.name, err.message);
    process.exit(1);
    //And ensure restarting the sever. Many hosting services provide this functionality

});

dotenv.config({path: './config.env'});
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() =>
    console.log('DB connection successful')).catch(err => console.log('DB connection failed'));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});




const mongoose = require('mongoose');
const dotenv = require('dotenv');

const connectDB = async () => {
    dotenv.config({path: './config/config.env'});
    const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true

    });
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
};

module.exports = connectDB;
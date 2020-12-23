const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const path = require('path');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const expressLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitizer = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const fileupload = require('express-fileupload');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

//Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const reviews = require('./routes/reviews');
const users = require('./routes/users');
const rateLimit = require('express-rate-limit');

// Connect database
connectDB();

//Load env vars

dotenv.config({ path: './config/config.env' });

const app = express();

//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File upload
app.use(fileupload());

// Sanitize app
app.use(mongoSanitizer());

// Set security headers
app.use(helmet());

// Rate limiter

const limiter = rateLimit({
  windowMs: 10 * 6 * 1000,
  max: 100,
});

app.use(limiter);

// Prevent http polution

app.use(hpp());

// Prevent cross-site xss attacks

app.use(xssClean());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejection

process.on('unhandledRejection', (err, promise) => {
  console.log(`ERROR: ${err.message}`.red.bold);
  //Close server and exit process
  server.close(() => {
    process.exit(1);
  });
});

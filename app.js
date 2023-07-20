const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const hbs = require('hbs');
const handlebarsHelpers = require("handlebars-helpers")();

const mongoose = require("mongoose");

const config = require('./config/config');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

const app = express();

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect('mongodb+srv://fayizcj94:lYgBK7CBpEBof1L5@cluster0.glddfks.mongodb.net/');
    console.log('Connected to the database.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

connectToDatabase();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.__express);
hbs.registerHelper(handlebarsHelpers);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin/', adminRouter);
app.use('/', userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

hbs.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

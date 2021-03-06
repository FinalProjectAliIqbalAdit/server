var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config()

var indexRouter = require('./routes/index');
const mongoose = require('mongoose');
var app = express();
var cors = require('cors')
// view engine setup


if(process.env.NODE_ENV == 'test') {
    mongoose.connect('mongodb://127.0.0.1:27017/finalProjectTest',{ useNewUrlParser: true, useCreateIndex: true, useFindAndModify : false })    
} else {
  mongoose.connect('mongodb://firemeet1:firemeet1@ds247759.mlab.com:47759/firemeet',{ useNewUrlParser: true, useCreateIndex: true, useFindAndModify : false })
  // mongoose.connect('mongodb://127.0.0.1:27017/finalProject',{ useNewUrlParser: true, useCreateIndex: true, useFindAndModify : false })    

  app.use(logger('dev'));
}
mongoose.connection.on("error", console.error.bind(console, "MongoDB connection error"))
mongoose.connection.once("open", ()=> {console.log("MongoDB Connected!")})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;

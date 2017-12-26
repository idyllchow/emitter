var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// var ejs = require('ejs');
// var init = require('./routes/authentication/init');
var index = require('./routes/index');
var android = require('./routes/android');
var ios = require('./routes/ios');
var about = require('./routes/about');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

// 设定view engine变量，意为网页模板引擎
//app.set('view engine', 'ejs');
app.set( 'view engine', 'html' );
app.engine( '.html', require( 'ejs' ).__express );

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var init = require('./routes/authentication/init');
app.use('/', init);

// app.use('/', index);
app.use('/android', android);
app.use('/ios', ios);
app.use('/about', about);


// app.get('/', function(req, res) {
//     res.render('index', { title: '主页' });
// });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
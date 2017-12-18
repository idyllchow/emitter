var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// var ejs = require('ejs');

var index = require('./routes/index');
var users = require('./routes/users');
var download = require('./routes/download');
var android = require('./routes/android');
var ios = require('./routes/ios');
var about = require('./routes/about');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
// app.engine('html',ejs.__express);
// app.set('view engine', 'html');
// app.engine('.html', require('ejs').__express);
// //设置视图模板的默认后缀名为.html,避免了每次res.Render("xx.html")的尴尬
// app.set('view engine', 'html');
// //设置模板文件文件夹,__dirname为全局变量,表示网站根目录
// app.set('views', __dirname + '/views');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/download', download);
app.use('/android', android);
app.use('/ios', ios);
app.use('/about', about);

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

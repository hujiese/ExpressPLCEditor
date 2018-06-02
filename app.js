var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

global.globalPath = __dirname;//保存工程的更目录
var index = require('./server/routes/index');
var users = require('./server/routes/users');
var file = require('./server/routes/file');
var tree = require('./server/routes/tree');

var app = express();

//set sessin
app.use(session({
  secret:'editor',
    cookie:{maxAge:1000*60*24*30},
    resave: false,
    saveUninitialized: true
}));

// view engine setup
app.set('views', path.join(__dirname + '/client', 'views'));

app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname + '/client', 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/file', file);
app.use('/tree', tree);

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

app.listen(3000, function(){
	console.log("listening port 3000");
});

module.exports = app;

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
var RedisStore = require('connect-redis')(session)

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// 載入設定
var config
global.__root_dir = __dirname
config = require(path.join(__root_dir, '/config/parameters'))

// view engine setuppma mysql
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.enable('trust proxy')
app.set('trust proxy', 1) // trust first proxy

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.urlencoded({ extended: true, limit: '3mb' }))
app.use(cookieParser('ok'));
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({secret: '1234567890QWERTY'}));
//app.use(session({
//  store: new RedisStore({
//    //host: config.redis.host,
//    //port: config.redis.port,
//    //db: config.redis.session.db,
//    //ttl: config.redis.session.ttl,
//    //prefix: config.redis.session.prefix
//    host: '127.0.0.1',
//    port: 6379,
//    db: 2,
//    ttl: 600000,
//    prefix: 'ok'
//  }),
//  resave: false,
//  saveUninitialized: true,
//  cookie: { secure: false, maxAge :999999},
//  secret: 'Hit_mE_aH_stUpIddd'
//}))

//app.use(function (req, res, next) {
//  if (!req.session) {
//    app.locals.user = {}
//  }
//  console.log(JSON.stringify(req.session))
//  return next() // otherwise continue
//})

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

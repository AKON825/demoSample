var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');

var userManager = require('../lib/userManager.js')()

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/game', function(req, res, next) {
  res.render('game', { title: 'Express' });
});

router.get('/api/username', function(req, res, next) {
  if( req.session.user && req.session.user.username ){
    return res.json({result:'ok', username: req.session.user.username})
  } else {
    return res.json({result:'error', msg: 'not login yet'})
  }
});

router.put('/api/username', function(req, res, next) {
  req.session['user'] = {}
  req.session.user.username = req.body.username
  req.session.user.id = uuid.v1()

  return res.json({result: 'ok', username: req.body.username, id: req.session.user.id})
});

router.get('/api/allOnlineUser', function(req, res, next) {
  return userManager.getAllOnlineUser(function (err, result) {
    if (err) {
      return res.json({result: 'error', msg: err.message})
    }

    return res.json({ result: 'ok', ret: result})
  })
});

router.get('/add', function (req, res) {
  if(req.session.isVisit) {
    req.session.isVisit++;

    return res.json({ya: 'the'+ req.session.isVisit+'time'})
  } else {
    req.session.isVisit = 1;

    return res.json({ya: 'first'})
  }
});

//var app = require('express')();
//var http = require('http').Server(app);
//var io = require('socket.io')(http);
var io = require('socket.io').listen(4000);
var run = 0;
io.use(function(socket, next){
  run++; // 0 -> 1
  next();
});
io.use(function(socket, next) {
  run++; // 1 -> 2
  next();
});
io.use(function(socket, next) {
  var handshakeData = socket.request;

  next();
});
io.on('connection', function(socket){
  console.log('跑是!!!',run)
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

//var srv = require('http').createServer();
//var io = require('socket.io')(srv);
//var run = 0;
//io.use(function(socket, next){
//  run++; // 0 -> 1
//  next();
//});
//io.use(function(socket, next) {
//  run++; // 1 -> 2
//  next();
//});
//var socket = require('socket.io-client')();
//socket.on('connect', function(){
//  // run == 2 at this time
//});

//http.listen(4000, function(){
//  console.log('listening on *:4000');
//});

module.exports = router;

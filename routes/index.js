module.exports = router;

var uuid = require('node-uuid');

var userManager = require('../lib/userManager.js')()

function router (app) {
  /* GET home page. */
  app.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });

  app.get('/game', function(req, res, next) {
    res.render('game', { title: 'Express' });
  });

  app.get('/api/username', function(req, res, next) {
    if( req.session.user && req.session.user.username ){
      return res.json({result:'ok', username: req.session.user.username})
    } else {
      return res.json({result:'error', msg: 'not login yet'})
    }
  });

  app.put('/api/username', function(req, res, next) {
    req.session['user'] = {}
    req.session.user.username = req.body.username
    req.session.user.id = uuid.v1()

    return res.json({result: 'ok', username: req.body.username, id: req.session.user.id})
  });

  app.get('/api/allOnlineUser', function(req, res, next) {
    return userManager.getAllOnlineUser(function (err, result) {
      if (err) {
        return res.json({result: 'error', msg: err.message})
      }

      return res.json({ result: 'ok', ret: result})
    })
  });

  app.get('/add', function (req, res) {
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

  //http.listen(4000, function(){
  //  console.log('listening on *:4000');
  //});
}
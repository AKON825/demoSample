module.exports = router;

var uuid = require('node-uuid');
var path = require('path');
var async = require('async')

var userManager = require('../lib/userManager.js')()
var config = require(path.join(__root_dir, '/config/parameters'))

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

  app.get('/login', function(req, res, next) {
    res.render('login', { title: 'Express' });
  });

  app.put('/api/fb_login_complete', function(req, res, next) {
    req.session['user'] = {}
    req.session.user.username = req.body.username
    req.session.user.id = req.body.fbId
    req.session.user.photoUrl = req.body.photoUrl

    return res.json({result: 'ok', username: req.body.username, id: req.session.user.id})
  });

  app.put('/api/logout', function(req, res, next) {
    delete req.session.user

    return res.json({result: 'ok'})
  });

  app.get('/api/getAllLoginUser', function(req, res, next) {
    return userManager.getAllLoginUser(function (err, result) {
      if (err) {
        return res.json({result: 'error', msg: err.message})
      }

      return res.json({ result: 'ok', ret: result})
    })
  });

  app.get('/api/allOnlineUser', function (req, res) {
    userManager.getAllOnlineUser(function(err, result){
      if (err) {
        return res.json({result: 'error', msg: err.message})
      }

      return res.json({ result: 'ok', ret: result})
    });
  });

  //var app = require('express')();
  //var http = require('http').Server(app);
  //var io = require('socket.io')(http);
  //var io = require('socket.io').listen(4000);
  var io = app.get('io')
  io.on('connection', function(socket){
    if (socket.request.session.user) {
      console.log('user ' + socket.request.session.user.username + ' connected 把這個人加入到上線列表');
      userManager.addToOnlineUser(socket.request.session, function(err){
        if (err) {
          return console.log(err)
        }

        userManager.getAllOnlineUser(function(err, result){
          if (err) {
            console.log(err)
          }

          //加入此使用者後, 送出所有上線的使用者list
          socket.emit("addAllOnlineUser", result);
        });

        socket.broadcast.emit("everyoneAddNewUser", socket.request.session.user)

        // 將這個人的連線指定特定的room
        socket.join(socket.request.session.user.id)
      })
    }

    socket.on('chat message', function(msg){
      io.emit('chat message', msg);
    });

    socket.on('chat to id', function(id, msg){
      var fromWho = socket.request.session.user.username
      // 也發送給自己
      socket.emit('chat message', fromWho, msg)
      io.to(id).emit('chat message', fromWho, msg)
    });

    socket.on('disconnect', function(){
      if (socket.request.session.user) {
        userManager.delFromOnlineUser(socket.request.session, function(err){
          if (err) {
            console.log(err)
          }

          socket.broadcast.emit("everyoneRemoveUser", socket.request.session.user)
          console.log('user disconnected 把這個人從上線列表拿出');
        })
      }
    });
  });
}
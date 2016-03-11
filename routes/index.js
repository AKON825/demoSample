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

  app.put('/api/username', function(req, res, next) {
    req.session['user'] = {}
    req.session.user.username = req.body.username
    req.session.user.id = uuid.v1()
    // 這裡的id其實可以考慮不要用uuid產生, 直接用redis中隊應的demo_sess就好了

    return res.json({result: 'ok', username: req.body.username, id: req.session.user.id})
  });

  app.get('/api/getAllLoginUser', function(req, res, next) {
    return userManager.getAllLoginUser(function (err, result) {
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

  app.get('/api/allOnlineUser', function (req, res) {
    getAllOnlineUser(function(err, result){
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
      addToOnlineUser(socket.request.session, function(err){
        if (err) {
          return console.log(err)
        }

        getAllOnlineUser(function(err, result){
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
      io.to(id).emit('chat message', fromWho, msg)
    });

    socket.on('disconnect', function(){
      delFromOnlineUser(socket.request.session, function(err){
        if (err) {
          console.log(err)
        }

        socket.broadcast.emit("everyoneRemoveUser", socket.request.session.user)
      })
      console.log('user disconnected 把這個人從上線列表拿出');
    });
  });

  var db = config.redis.session.chat_db || 3
  var redisClient = require('redis').createClient(config.redis.port, config.redis.host)

  function addToOnlineUser(sessionData, cb) {
    return selectDatebase()

    function selectDatebase () {
      redisClient.select(db, function (err) {
        if (err) {
          return cb(err)
        }

        return setUserHash()
      })
    }

    function setUserHash () {
      redisClient.HMSET ('user:' + sessionData.user.id, 'username', sessionData.user.username, function (err, redisResult) {
        if (err) {
          return cb(err)
        }

        return cb()
      })
    }
  }

  function delFromOnlineUser(sessionData, cb) {
    return selectDatebase()

    function selectDatebase () {
      redisClient.select(db, function (err) {
        if (err) {
          return cb(err)
        }

        return delUserHash()
      })
    }

    function delUserHash () {
      redisClient.del ('user:' + sessionData.user.id, function (err, redisResult) {
        if (err) {
          return cb(err)
        }

        return cb()
      })
    }
  }

  function getAllOnlineUser(cb) {
    var userArray = []
    return selectDatebase()

    function selectDatebase () {
      redisClient.select(db, function (err) {
        if (err) {
          return cb(err)
        }

        return getAllUserKeys()
      })
    }

    function getAllUserKeys () {
      redisClient.keys('user:' + '*', function (err, redisResult) {
        if (err) {
          return cb(err)
        }

        return allUserDataToArray(redisResult)
      })
    }

    function allUserDataToArray (allKeys) {
      return async.each(allKeys, function(redisKey, asyncCb) {
        var userObj = {}
        redisClient.hvals(redisKey, function (err, redisResult) {
          if (err) {
            return asyncCb(err)
          }

          var username = redisResult[0]
          var id = redisKey.replace(/user:/g, '');

          userObj.id = id
          userObj.username = username
          userArray.push(userObj)

          return asyncCb()
        })
      }, function(err){
        if (err) {
          return cb(err)
        }

        return cb(null, userArray)
      });
    }
  }
}
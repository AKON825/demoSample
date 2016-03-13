module.exports = UserManager

var async = require('async')

var config = require('../config/parameters')
var validator = require('../validator')

function UserManager () {
  if (!(this instanceof UserManager)) {
    return new UserManager()
  }

  /**
   * 回傳所有線上使用者
   *
   * @param {Integer} id
   */
  this.getAllLoginUser = function (cb) {
    var db = config.redis.session.db || 2
    var redisClient = require('redis').createClient(config.redis.port, config.redis.host)

    return selectDatebase()

    function selectDatebase () {
      redisClient.select(db, function (err) {
        if (err) {
          return cb(err)
        }

        return getKeys()
      })
    }

    function getKeys () {
      redisClient.keys(config.redis.session.prefix + '*', function (err, redisResult) {
        if (err) {
          return cb(err)
        }

        return userToArray(redisResult)
      })
    }

    function userToArray (redisKeys) {
      var userArray = []
      return async.each(redisKeys, function(redisKey, asyncCb) {
        redisClient.get(redisKey, function (err, redisResult) {
          if (err) {
            return asyncCb(err)
          }

          if (!validator.isJsonString(redisResult)) {
            return asyncCb()
          }

          var session = JSON.parse(redisResult)

          userArray.push(session.user)

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

  var db = config.redis.session.chat_db || 3
  var redisClient = require('redis').createClient(config.redis.port, config.redis.host)

  this.addToOnlineUser = function (sessionData, cb) {
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
      redisClient.HMSET ('user:' + sessionData.user.id, 'username', sessionData.user.username, 'photo_url', sessionData.user.photoUrl, function (err, redisResult) {
        if (err) {
          return cb(err)
        }

        return cb()
      })
    }
  }

  this.delFromOnlineUser = function (sessionData, cb) {
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

  this.getAllOnlineUser = function (cb) {
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
        redisClient.hmget(redisKey, 'photo_url', 'username', function (err, redisResult) {
          if (err) {
            return asyncCb(err)
          }

          var photoUrl = redisResult[0]
          var username = redisResult[1]
          var id = redisKey.replace(/user:/g, '');

          userObj.id = id
          userObj.username = username
          userObj.photoUrl = photoUrl
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

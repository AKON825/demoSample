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
}

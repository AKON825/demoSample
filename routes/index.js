var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/t', function(req, res, next) {
  res.render('tem', { title: 'Express' });
});

router.get('/game', function(req, res, next) {
  res.render('game', { title: 'Express' });
});

router.put('/api/set_username', function(req, res, next) {
  req.session['user'] = {}
  req.session.user.username = req.body.username

  return res.json({username: req.body.username})
});

router.get('/st', function(req, res, next) {
  delete req.session.user
  req.session['user'] = {}
  req.session.user.username = 'fuck'

  return res.json({name: req.session.user.username})
});

router.get('/gt', function(req, res, next) {
  //delete req.session.user
  return res.json({name: req.session.user.username})
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

io.on('connection', function(socket){
  console.log('a user connected');
});

//http.listen(4000, function(){
//  console.log('listening on *:4000');
//});


module.exports = router;

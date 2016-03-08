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

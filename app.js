var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userCount=0;

app.get('/', function(req, res) {
   res.sendfile('index.html');
});

users = [];
io.on('connection', function(socket) {
   console.log('A user connected');
   userCount++;
   console.log("Total Users Connected: "+ userCount);
   socket.on('setUsername', function(data) {
      console.log(data);
      if(users.indexOf(data) > -1) {
         socket.emit('userExists', data + ' username is taken! Try some other username.');
      } else {
         users.push(data);
         socket.emit('userSet', {username: data});
         
      }
   });
   
   socket.on('msg', function(data) {
      //Send message to everyone
      io.sockets.emit('newmsg', data);
   });

   socket.on('disconnect', function () {
    console.log('A user disconnected');
    userCount--;
    console.log("Total Users Connected: "+ userCount);
 });

});

http.listen(3000, function() {
   console.log('listening on localhost:3000');
});
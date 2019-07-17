var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userCount=0;
const mongoose = require ('mongoose');
const bodyParser = require('body-parser');

mongoose.connect("mongodb://localhost:27017/chatdemo", {useNewUrlParser: true });
var mchat = require('./chatmodel.js').chat;


app.get('/', function(req, res) {
	console.log("attempt: 1");
	 res.sendfile('index.html');
});
users = [];
io.on('connection', function(socket) {
	console.log('A user connected');
	var address = socket.handshake.address; 
	console.log("IP--" + address);
	userCount++;
	console.log("Total Users Connected: "+ userCount);
	socket.on('setUsername', function(data) {
		//console.log(data); display connected user name
		if(users.indexOf(data) > -1) {
			 socket.emit('userExists', data + ' username is taken! Try some other username.');
		} else {
			 users.push(data);
			 socket.emit('userSet', {username: data});
			// to create new user or add msg to user
			mchat.find({ username: data}, function(err, dataExist){
				if(err){
					console.log("Error while fetchng data");
					console.log(err);
				}
				else if(dataExist && dataExist.length >0){
					console.log("user already exists ");
				}
				else{
					mchatObj = new mchat();
					mchatObj.username = data;
					mchatObj.lastLogin = new Date();
					mchatObj.ipaddress = address;
					// mchatObj.message = [];
					mchatObj.save(function(err)
					{
						if(err)	
						{
							console.log("error occured while adding data" );
							console.log(err);
						}
						else
						{
							console.log("Data added Successfully");
						}
					});
				}
			});
			 console.log("Users Name");
			 console.log(users);
		}
	});
	 
	socket.on('msg', function(data) {
			//Send message to everyone
			io.sockets.emit('newmsg', data);
			console.log("mesg check");
			console.log(data);
			//save msg to db
			mchat.findOne({username: data.user}, function(err,result){
				if(err){
					console.log("error while adding msgs");
					console.log(err);
				}
				else if(result){
					//console.log("-------duurrrrrrr");
					//console.log(result);
					let swat = {};
					swat.content =  data.message;
					swat.crAt = new Date();
					result.message.push(swat);
					result.save( function(err,out){
						if(err){
							console.log("errror while adding  msg");
						}
						else if(out){
							console.log("------- msg added");
							//console.log(out)
						}
					})
				}
				else{
					console.log(result);
					console.log("no user found. Can't add msgs");
				}
			});
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
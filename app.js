const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const getmacVAr = require('getmac');

let userMacAdd = "";
let users = [];
let userCount = 0;

//getting mac address of user
getmacVAr.getMac(function (err, macAddress) {
	if (!err) {
		userMacAdd = macAddress
	}
});

mongoose.connect("mongodb://localhost:27017/chatdemo", { useNewUrlParser: true });
var mchat = require('./chatmodel.js').chat;

app.get('/', function (req, res) {
	res.sendfile('index.html');
});


io.on('connection', function (socket) {
	console.log('A user connected');
	let address = socket.handshake.address;
	// console.log("IP--" + address);
	userCount++;
	console.log("Total Users Connected: " + userCount);
	socket.on('setUsername', function (data) {
		//console.log(data); display connected user name
		if (users.indexOf(data) > -1) {
			socket.emit('userExists', data + ' username is taken! Try some other username.');
		} else {
			users.push(data);
			socket.emit('userSet', { username: data });
			// to create new user or add msg to user
			mchat.find({ username: data }, function (err, dataExist) {
				if (err) {
					console.log("Error while fetching data");
					console.log(err);
				}
				else if (dataExist && dataExist.length > 0) {
					console.log("user already exists ");
				}
				else {
					mchatObj = new mchat();
					mchatObj.userName = data;
					mchatObj.lastLogin = new Date();
					mchatObj.ipAdd = address;
					mchatObj.macAdd = userMacAdd;
					mchatObj.save(function (err) {
						if (err) {
							console.log("error occured while adding data");
							console.log(err);
						}
						else {
							console.log("Data added Successfully");
						}
					});
				}
			});
			console.log("User Names");
			console.log(users);
		}
	});

	socket.on('msg', function (data) {
		//Send message to everyone
		io.sockets.emit('newmsg', data);
		console.log(data);
		//save msg to db
		mchat.findOne({ userName: data.user }, function (err, result) {
			if (err) {
				console.log("error while adding msgs");
				console.log(err);
			}
			else if (result) {
				let swat = {};
				swat.content = data.message;
				swat.crAt = new Date();
				result.message.push(swat);
				result.save(function (err, out) {
					if (err) {
						console.log("errror while adding  msg");
						console.log(err)
					}
					else if (out) {
						// console.log("------- msg added");
					}
				});
			}
			else {
				console.log(result);
				console.log("no user found. Can't add msgs");
			}
		});
	});

	socket.on('disconnect', function () {
		console.log('A user disconnected');
		userCount--;
		console.log("Total Users Connected: " + userCount);
	});

});

http.listen(3000, function () {
	console.log('listening on localhost:3000');
});
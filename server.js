const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use('/', express.static('public'));

app.get('/', function (req, res) {
	res.sendfile('index.html');
});

let users = [];

io.on('connection', function (client) {

	console.log('New user connected');

	client.on('setUsername', function (data) {
		if (data != undefined) {
			console.log(data);
			if (users.indexOf(data) > -1) {
				client.emit("errorCreatingUser", "Username already exists");
			}
			else {
				users.push(data);
				client.thisUsername = data;
				client.emit('userCreated', { username: data });
			}
		} else {
			client.emit("errorCreatingUser", "User not created");
		}
	});

	client.on('message', function (data) {
		io.sockets.emit('newMessage', data);
	})

	client.on('disconnect', () => {
		console.log(client.thisUsername +' disconnected');
		users.splice(users.indexOf(client.thisUsername), 1);
	});

});

let nsp = io.of('/my-namespace');
nsp.on('connection', function(socket) {
   console.log('someone connected');
   nsp.emit('hi', 'Hello everyone!');
});

var nsp  = io.of('/my-namespace');

nsp.on('connection', function(socket){
  console.log("someone connected");
})
nsp.emit("hi","everyone");

io.on('connection', function(socket){
  socket.join('some room');
});

io.to('some room').emit('some event');


var roomno = 1;
io.on('connection', function(socket) {
   
   //Increase roomno 2 clients are present in a room.
   if(io.nsps['/'].adapter.rooms["room-"+roomno] && io.nsps['/'].adapter.rooms["room-"+roomno].length > 1) roomno++;
   socket.join("room-"+roomno);

   //Send this event to everyone in the room.
   io.sockets.in("room-"+roomno).emit('connectToRoom', "You are in room no. "+roomno);
})

socket.leave("room-"+roomno);


http.listen(2200, function () {
	console.log('Server listening on port: 2200');
});
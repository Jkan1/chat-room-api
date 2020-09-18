'use strict';

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const socket_io = require('socket.io');
const socketIO = socket_io(server);

let rooms = [];
let clients = [];

app.use('/', express.static('public'));

app.get('/', function (req, res) {
  res.sendFile('index.html');
});

const chatSpace = socketIO;

chatSpace.on('connection', (socket) => {

  socket.on('initUser', (payload) => {

    if (clients.length < 1) {
      socket.username = payload.username;
      clients.push({ username: payload.username, status: 1 });
      console.log("User created succesfully");
      socket.emit('usernameSuccess', payload.username);
    }
    else if (clients.findIndex(user => user.username == payload.username) == -1) {
      socket.username = payload.username;
      clients.push({ username: payload.username, status: 1 });
      console.log("User created succesfully");
      socket.emit('usernameSuccess', payload.username);
    } else {
      let clientIndex = clients.findIndex(user => user.username == payload.username)
      if (clients[clientIndex].status == 0) {
        clients[clientIndex].status = 1;
        console.log("Welcome back " + clients[clientIndex].username);
        socket.emit('usernameSuccess', clients[clientIndex].username);
      } else {
        console.log("Username already taken");
        socket.emit('usernameFailure', { message: "Username already taken" });
      }
    }
  })

  socket.on('sendMessage', data => {
    //Perform DB calls
    socket.emit('messageSent', { message: data.message })
    // setTimeout(() => { socket.emit('receivedMessage', { message: "hello " + socket.username }) }, 2000)
  })

  socket.on('getOnlineUsers', () => {
    socket.emit('showOnlineUsers', { users: clients });
  })

  socket.on('disconnect', function () {
    if (clients.length > 0) {
      let clientIndex = clients.findIndex(user => user.username == socket.username);
      clients[clientIndex].status = 0
    }
  });




  socket.on('sendTo',(data)=>{
    console.log("SEND TO DATA",data);
    console.log("ROOMS", rooms);
    console.log("clients", clients);
    rooms.push(data.to);
    socket.join(data.to);
    socket.to(data.to).emit('receivedMessage', data.message || "asdasdASLLL");
  })

  socket.on('JoinRoom', (data) => {
    console.log(data);
    // console.log(socket.adapter.rooms);
    // Object.keys(socket.adapter.rooms).forEach((roomName)=>{
      socket.leaveAll()
    // })
    socket.join(data.roomName);
  })


});

server.listen(3003, console.log("Server listening on port 3003"));
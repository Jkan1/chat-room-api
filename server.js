'use strict';

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const socket_io = require('socket.io');
const socketIO = socket_io(server);

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
      socket.leaveAll()
      socket.join(payload.username);
      socket.USERNAME = payload.username;
      console.log("New User :", socket.USERNAME);
      socket.emit('usernameSuccess', payload.username);
    }
    else if (clients.findIndex(user => user.username == payload.username) == -1) {
      socket.username = payload.username;
      clients.push({ username: payload.username, status: 1 });
      socket.leaveAll()
      socket.join(payload.username);
      socket.USERNAME = payload.username;
      console.log("New User :", socket.USERNAME);
      socket.emit('usernameSuccess', payload.username);
    } else {
      let clientIndex = clients.findIndex(user => user.username == payload.username)
      if (clients[clientIndex].status == 0) {
        clients[clientIndex].status = 1;
        socket.leaveAll()
        socket.join(clients[clientIndex].username);
        socket.USERNAME = payload.username;
        console.log("Old User :", socket.USERNAME);
        socket.emit('usernameSuccess', clients[clientIndex].username);
      } else {
        console.error("Username already taken");
        socket.emit('usernameFailure', { message: "Username already taken" });
      }
    }
  })

  socket.on('getOnlineUsers', () => {
    socket.emit('showOnlineUsers', { users: clients });
  })

  socket.on('disconnect', function () {
    if (clients.length > 0) {
      let clientIndex = clients.findIndex(user => user.username == socket.username);
      clients[clientIndex] ? clients[clientIndex].status = 0 : null;
    }
  });

  socket.on('sendTo', (data) => {
    socket.to(data.to).emit('receivedMessage', { message: data.message || "BLOCKED", from: socket.USERNAME });
  });


});

server.listen(3003, console.log("Server listening on port 3003"));
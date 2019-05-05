'use strict';

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socket_io = require('socket.io');
const socketIO = socket_io(server);
const mustacheExpress = require('mustache-express');

const util = require('./utility/lib');

app.engine('html', mustacheExpress())
app.set('view engine', 'html');
app.set('views', __dirname + '/public')

const ROOMS = {
  EARTH: 'EARTH',
  MARS: 'MARS',
  PLUTO: 'PLUTO'
}
let CLIENTS = [];
let DATA = {
  EARTH: [],
  MARS: [],
  PLUTO: []
}
let messages=[]

app.use('/', express.static('public'));

app.get('/', function (req, res) {

  res.render('test');
});

const chatSpace = socketIO.of('/GALAXY');

chatSpace.on('connection', (socket) => {

  socket.on('createUser', (data) => {

    if (CLIENTS.length < 1) {
      socket.username = data.username;
      CLIENTS.push({
        id: util.getId(socket),
        username: data.username,
        status: 1
      })
      socket.emit('usernameSuccess', {
        message: "user created succesfully",
        id: util.getId(socket)
      });
    }
    else if (CLIENTS.findIndex(user => user.username == data.username) == -1) {
      socket.username = data.username;
      CLIENTS.push({
        id: util.getId(socket),
        username: data.username,
        status: 1
      })
      socket.emit('usernameSuccess', {
        message: "user created succesfully",
        id: util.getId(socket)
      });
    } else {
      let clientIndex = CLIENTS.findIndex(user => user.username == data.username)
      if (CLIENTS[clientIndex].status == 0) {
        CLIENTS[clientIndex].status = 1;
        CLIENTS[clientIndex].id = util.getId(socket);
        socket.emit('usernameSuccess', {
          message: "welcome back user",
          id: util.getId(socket)
        });
      } else {
        socket.emit('usernameFailure', {
          message: "username already taken"
        });
      }
    }
  })

  socket.on('sendMessage', data => {
    //Perform DB calls
    messages.push({
      id: socket.id,
      username: socket.username,
      message: data.message,
      to:data.to
    })
    socket.join(data.to);
    chatSpace.in(data.to).emit('receivedMessage', { message: data.message });
    // chatSpace.emit('receivedMessage', { data: messages })
    console.log(messages);
  })

  socket.on('getOnlineUsers', (data) => {
    socket.emit('showOnlineUsers', { users: CLIENTS })
    console.log(CLIENTS);
  })

  socket.on('disconnect', function () {
    if (CLIENTS.length > 0) {
      let clientIndex = CLIENTS.findIndex(user => user.username == socket.username);
      CLIENTS[clientIndex].status = 0
    }
  });

  socket.on('sendTo', (data) => {
    rooms.push(data.to);
    socket.join(data.to);
    socket.to(data.to).emit('message', data.message);
  })

});

server.listen(3033, console.log("Server listening on port 3003"));
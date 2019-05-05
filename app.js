'use strict';

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socket_io = require('socket.io');
const socketIO = socket_io(server);
const Handlebars = require('handlebars');
const mustache = require('mustache');
const path = require('path');

app.set('view engine','html');
app.set('views',path.join(__dirname, 'public'))
app.engine('html',mustache())

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

app.use('/', express.static('public'));

app.get('/', function (req, res) {

  res.render('profile');

  // var source = "<p>Hello, my name is {{name}}. I am from {{hometown}}. I have " +
  //   "{{kids.length}} kids:</p>" +
  //   "<ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>";
  //var template = Handlebars.compile(source);

  // var data = {
  //   "name": "Alan", "hometown": "Somewhere, TX",
  //   "kids": [{ "name": "Jimmy", "age": "12" }, { "name": "Sally", "age": "4" }]
  // };
  // var result = template(data);


  // res.render('');
});

const chatSpace = socketIO.of('/GALAXY');

chatSpace.on('connection', (socket) => {

  socket.on('createUser', (data) => {

    if (CLIENTS.length < 1) {
      socket.username = data.username;
      CLIENTS.push({ id: getId(socket), username: data.username, status: 1 })
      socket.emit('usernameSuccess', { message: "user created succesfully", id: getId(socket) });
    }
    else if (CLIENTS.findIndex(user => user.username == data.username) == -1) {
      socket.username = data.username;
      CLIENTS.push({ id: getId(socket), username: data.username, status: 1 })
      socket.emit('usernameSuccess', { message: "user created succesfully", id: getId(socket) });
    } else {
      let clientIndex = CLIENTS.findIndex(user => user.username == data.username)
      if (CLIENTS[clientIndex].status == 0) {
        CLIENTS[clientIndex].status = 1;
        CLIENTS[clientIndex].id = getId(socket);
        socket.emit('usernameSuccess', { message: "welcome back user", id: getId(socket) });
      } else {
        socket.emit('usernameFailure', { message: "username already taken" });
      }
    }
    // console.log("client id : ",socket.id);
    // console.log(socket.nsp.name);


  })

  socket.on('sendMessage', data => {
    //Perform DB calls
    messages.push({
      id: socket.id,
      username: socket.username,
      message: data.message
    })
    // socket.emit('messageSent', { message: data.message })
    // setTimeout(() => { socket.emit('receivedMessage', { message: "hello " + socket.username }) }, 2000)
    chatSpace.emit('receivedMessage', { data: messages })
    // console.log(messages);
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


  // setInterval(() => {
  //   console.log("--refresh--");
  //   socket.emit('connectedRooms', { users: CLIENTS });
  // }, 10000);

});


function getRoom(socket) {
  let nsp = socket.nsp.name
  let rooms = Object.keys(socket.rooms);
  for (let i = 0; i < rooms.length; i++) {
    rooms[i] = rooms[i].replace(nsp + "#", '')
  }
  return rooms;
}

function getId(socket) {
  let id = socket.id;
  let nsp = socket.nsp.name
  id = id.replace(nsp + "#", '')
  return id;
}


// setInterval(() => {
//   console.log("--refresh--");
//   chatSpace.emit('onlineUsers', { users: CLIENTS });
// }, 10000);

server.listen(3003, console.log("Server listening on port 3003"));
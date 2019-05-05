var socket = io('/GALAXY');

socket.on('usernameSuccess', successUsername);
socket.on('usernameFailure', failureUsername);
socket.on('receivedMessage', receivedMessage);
socket.on('showOnlineUsers', refreshOnlineUsers);
let thisUsername;
// window.setInterval(() => {
//   socket.emit('getOnlineUsers', "get online users list");
//   // var scroll = document.getElementById('messageBoard');
//   // scroll.scrollTop = scroll.scrollHeight;
//   // scroll.animate({ scrollTop: scroll.scrollHeight }, { duration: 2000 });
// }, 2000)

function scrollMessageBoard() {
  var scroll = document.getElementById('messageBoard');
  scroll.scrollTop = scroll.scrollHeight;
  scroll.animate({ scrollTop: scroll.scrollHeight }, { duration: 2000 });
}

//   $(function(){
//      $("#submit").click(function(){
//          $('#scrollChat').animate({
//              scrollTop: $('#scrollChat')[0].scrollHeight}, "slow");
//      });
//  });

function onUsernameInput() {
  let usernameInput = document.getElementById('usernameInput');
  let username = usernameInput.value;
  if (username && username.length > 2) {
    createUser(username);
  } else {
    alert("enter correct username");
  }
}

function createUser(data) {
  socket.emit('createUser', { username: data });
}

function successUsername(data) {
  thisUsername = data.id;
  let rightContainer1 = document.getElementById('rightContainer1');
  let rightContainer2 = document.getElementById('rightContainer2');
  rightContainer1.style.display = 'none';
  rightContainer2.style.display = 'block';
}

function failureUsername(data) {
  alert(data.message);
  let rightContainer1 = document.getElementById('rightContainer1');
  let rightContainer2 = document.getElementById('rightContainer2');
  if (rightContainer2.style.display == 'block') {
    rightContainer2.style.display = 'none';
    rightContainer1.style.display = 'block';
  }
}

function messageSent(data) {
  let messageInput = document.getElementById("messageInput");
  messageInput.value = '';
  let messageNode = document.createElement("LI");
  let textnode = document.createTextNode(data.message);
  messageNode.id = "message1";
  messageNode.appendChild(textnode);
  document.getElementById("messageBoard").appendChild(messageNode);
}

function sendMessage(data) {
  let to = document.getElementById("selectedUser").innerHTML;
  socket.emit("sendMessage", { message: data,to:to });
}

function onMessageSend() {
  let messageInput = document.getElementById("messageInput");
  let data = messageInput.value;
  sendMessage(data);
}

function receivedMessage(data) {
  let messageNode = document.createElement("LI");
  let textnode = document.createTextNode(data.message);
  messageNode.id = "message2";
  messageNode.appendChild(textnode);
  document.getElementById("messageBoard").appendChild(messageNode);
}

function receivedMessage2(data) {
  document.getElementById("messageBoard").innerHTML = ''
  for (let i = 0; i < data.data.length; i++) {
    if (data.data[i].id === thisUsername)
      messageSent(data.data[i])
    else
      receivedMessage(data.data[i])
  }
}

function createMessageBoard(data) {
  alert(data)
  let messageNode = document.createElement("LI");
  let textnode = document.createTextNode(data.message);
  messageNode.id = "message2";
  messageNode.appendChild(textnode);
  document.getElementById("messageBoard").appendChild(messageNode);
}

function checkOnlineUsers() {
  socket.emit('getOnlineUsers', "get online users list");
}

function refreshOnlineUsers(data) {
  document.getElementById("sideBoard").innerHTML = '';
  for (index = 0; index < data.users.length; index++) {
    displayOnlineUser(data.users[index]);
  }
}

function displayOnlineUser(user) {
  // alert(user.username)
  let userNode = document.createElement("LI");
  let textnode = document.createTextNode(user.username);
  if (user.status == 1)
  userNode.setAttribute("class","onlineUser card hoverable");
  else
  userNode.setAttribute("class","offlineUser card hoverable");
  userNode.appendChild(textnode);
  userNode.setAttribute("id", user.id);
  userNode.setAttribute("onClick", "selectUser(this)");
  document.getElementById("sideBoard").appendChild(userNode);
}

function selectUser(selectedItem) {
  document.getElementById('selectedUser').innerHTML = selectedItem.id;
}

function sendToUser() {
  let data = document.getElementById("messageInput").value;
  let user = document.getElementById("selectedUser").innerHTML;
  socket.emit('sendTo', { to: user, message: data })
}

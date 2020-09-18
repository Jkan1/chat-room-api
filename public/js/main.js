var socket = io('http://localhost:3003');
var GLOBAL_USERNAME;
socket.on('usernameSuccess', successUsername);
socket.on('usernameFailure', failureUsername);

socket.on('messageSent', messageSent);
socket.on('receivedMessage', receivedMessage);

socket.on('showOnlineUsers', refreshOnlineUsers);

function scrollMessageBoard() {
  var scroll = document.getElementById('messageBoard');
  scroll.scrollTop = scroll.scrollHeight;
  scroll.animate({ scrollTop: scroll.scrollHeight }, { duration: 2000 });
}

function onUsernameSubmit() {
  let userNameInput = document.getElementById('userNameInput');
  let username = userNameInput.value;
  console.log("username : ",username);
  if (username && username.length > 2 && username.length <= 8) {
    socket.emit('initUser', { username: username });
  } else {
    alert("Enter valid username (min length 3 | max length 8)");
    document.getElementById('userNameInput').value = '';
  }
}

function successUsername(username) {
  GLOBAL_USERNAME = username;
  let userCreation = document.getElementById('user-creation');
  let messageSpace = document.getElementById('message-space');
  userCreation.style.display = 'none';
  messageSpace.style.display = 'block';
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
  sendToUser();
  socket.emit("sendMessage", { message: data });
}

function onMessageSend() {
  let messageInput = document.getElementById("messageInput");
  let data = messageInput.value;
  console.log(data);
  sendMessage(data);
}

function receivedMessage(data) {

  let messageNode = document.createElement("LI");
  let textnode = document.createTextNode(data);
  messageNode.id = "message2";
  messageNode.appendChild(textnode);
  document.getElementById("messageBoard").appendChild(messageNode);
}

function checkOnlineUsers() {
  socket.emit('getOnlineUsers');
}

function refreshOnlineUsers(data) {
  document.getElementById("inbox_chat").innerHTML = '';
  for (index = 0; index < data.users.length; index++) {
    displayOnlineUserV2(data.users[index]);
  }
}

function displayOnlineUserV2(userData) {
  let div1 = document.createElement("DIV");
  div1.setAttribute("class", "chat_list");
  div1.setAttribute("onClick", "selectUser(this)");

  let div2 = document.createElement("DIV");
  div2.setAttribute("class", "chat_people");

  let div3 = document.createElement("DIV");
  div3.setAttribute("class", "chat_img");
  let img = document.createElement("IMG");
  img.setAttribute("src", "https://ptetutorials.com/images/user-profile.png");
  div3.appendChild(img);

  let div4 = document.createElement("DIV");
  div4.setAttribute("class", "chat_ib");

  let h5 = document.createElement('H5');
  let usernameText = document.createTextNode(userData.username);
  h5.appendChild(usernameText);
  let span = document.createElement('SPAN');
  span.setAttribute('class', 'chat_date');
  if (userData.status) {
    span.appendChild(document.createTextNode('ONLINE'));
    span.id = 'user-online';
  } else {
    span.appendChild(document.createTextNode('OFFLINE'));
    span.id = 'user-offline';
  }
  h5.appendChild(span);
  div4.appendChild(h5);

  div2.appendChild(div3);
  div2.appendChild(div4);
  div1.appendChild(div2);

  // let textnode = document.createTextNode('username');
  // if (1)
  //   userNode.id = "onlineUser";
  // else
  //   userNode.id = "offlineUser";
  // userNode.appendChild(textnode);
  // userNode.setAttribute("class", "card hoverable" );
  // userNode.setAttribute("onClick", "selectUser(this)" );
  document.getElementById("inbox_chat").appendChild(div1);
}

function selectUser(selectedItem){
  // selectedItem.setAttribute("onClick", "selectUser(this)" );
  document.getElementById('selectedUser').innerHTML = selectedItem.innerHTML;
  socket.emit("JoinRoom", { roomName: selectedItem.innerHTML })
}

function sendToUser(){
  let data = document.getElementById("messageInput").value;
  console.log(data);
  let user = document.getElementById("selectedUser").innerHTML;
  console.log({ to: user, message: data });
  socket.emit('sendTo',{to:user,message:data})
}

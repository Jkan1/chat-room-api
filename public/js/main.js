var socket = io('http://localhost:3003');

const MESSAGE_TYPE_OUTGOING = "OUT";
const MESSAGE_TYPE_INCOMING = "IN";
var GLOBAL_USERNAME;
var SELECTED_CHAT;
var GLOBAL_MESSAGES = {};

socket.on('usernameSuccess', successUsername);
socket.on('usernameFailure', failureUsername);

socket.on('receivedMessage', receivedMessage);

socket.on('showOnlineUsers', refreshOnlineUsers);

function scrollMessageBoard() {
  var scroll = document.getElementById('msg_history');
  scroll.scrollTop = scroll.scrollHeight;
  scroll.animate({ scrollTop: scroll.scrollHeight }, { duration: 1000 });
}

function onUsernameSubmit() {
  let userNameInput = document.getElementById('userNameInput');
  let username = userNameInput.value;
  console.log("username : ", username);
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
  checkOnlineUsers();
  createUserDesc();
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

function onMessageSend() {
  if(!SELECTED_CHAT){
    alert('Please select a chat first');
    return;
  }
  let toUser = SELECTED_CHAT.id;
  let messageInput = document.getElementById("messageInput");
  let message = messageInput.value;
  messageInput.value = '';
  if (!message || !message.trim()) {
    return;
  }
  console.log("message :", message);
  processMessage(MESSAGE_TYPE_OUTGOING, toUser, message);
}

function receivedMessage(response) {
  let message = response.message;
  let from = response.from;
  console.log("message :", message);
  processMessage(MESSAGE_TYPE_INCOMING, from, message);
}

function processMessage(type, room, message) {
  if (!GLOBAL_MESSAGES[room]) {
    GLOBAL_MESSAGES[room] = [];
  }
  GLOBAL_MESSAGES[room].push({ type, message, dateTime: new Date() });
  if (type == MESSAGE_TYPE_OUTGOING) {
    socket.emit('sendTo', { to: room, message: message });
  }
  refreshMessages();
}

function refreshMessages() {
  document.getElementById("msg_history").innerHTML = '';
  if (GLOBAL_MESSAGES && SELECTED_CHAT) {
    if (GLOBAL_MESSAGES[SELECTED_CHAT.id] && GLOBAL_MESSAGES[SELECTED_CHAT.id].length) {
      GLOBAL_MESSAGES[SELECTED_CHAT.id].forEach((messageData) => {
        if(messageData.type == MESSAGE_TYPE_OUTGOING){
          createOutgoingMessage(messageData);
        }else{
          createIncomingMessage(messageData);
        }
      });
    }
  }
  scrollMessageBoard();
}

function checkOnlineUsers() {
  socket.emit('getOnlineUsers');
}

function refreshOnlineUsers(data) {
  document.getElementById("inbox_chat").innerHTML = '';
  for (index = 0; index < data.users.length; index++) {
    if (data.users[index] && data.users[index].username != GLOBAL_USERNAME)
      displayOnlineUser(data.users[index]);
  }
}

function displayOnlineUser(userData) {
  let div1 = document.createElement("DIV");
  div1.setAttribute("class", "chat_list");
  div1.setAttribute("onClick", "selectUser(this)");
  div1.id = userData.username;

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

  document.getElementById("inbox_chat").appendChild(div1);
}

function selectUser(selectedItem) {
  if (!SELECTED_CHAT) {
    SELECTED_CHAT = selectedItem;
  }
  SELECTED_CHAT.setAttribute('class', 'chat_list');
  SELECTED_CHAT = selectedItem;
  SELECTED_CHAT.setAttribute('class', 'chat_list active_chat');
  refreshMessages();
}

function createOutgoingMessage(messageData) {
  let div1 = document.createElement("DIV");
  div1.setAttribute("class", "outgoing_msg");

  let div2 = document.createElement("DIV");
  div2.setAttribute("class", "sent_msg");

  let para = document.createElement('P');
  let messageText = document.createTextNode(messageData.message);
  para.appendChild(messageText);
  div2.appendChild(para);

  let span = document.createElement('SPAN');
  span.setAttribute('class', 'time_date');
  span.appendChild(document.createTextNode((messageData.dateTime || new Date()).toUTCString().slice(0,22)));
  div2.appendChild(span);

  div1.appendChild(div2);

  document.getElementById("msg_history").appendChild(div1);
}

function createIncomingMessage(messageData) {
  let div1 = document.createElement("DIV");
  div1.setAttribute("class", "incoming_msg");

  let div2 = document.createElement("DIV");
  div2.setAttribute("class", "received_msg");

  let div3 = document.createElement("DIV");
  div3.setAttribute("class", "received_withd_msg");

  let para = document.createElement('P');
  let messageText = document.createTextNode(messageData.message);
  para.appendChild(messageText);
  div3.appendChild(para);

  let span = document.createElement('SPAN');
  span.setAttribute('class', 'time_date');
  span.appendChild(document.createTextNode((messageData.dateTime).toUTCString().slice(0, 22)));
  div3.appendChild(span);

  div2.appendChild(div3);
  div1.appendChild(div2);

  document.getElementById("msg_history").appendChild(div1);
}

function createUserDesc() {
  let P = document.createElement("P");
  P.setAttribute("class", "user-desc");

  let userDescText = "You are logged in as ";
  let userDesc = document.createTextNode(userDescText);
  P.appendChild(userDesc);
  let userNameSpan = document.createElement("SPAN");
  userNameSpan.appendChild(document.createTextNode(GLOBAL_USERNAME));
  P.appendChild(userNameSpan);

  document.getElementById("container").appendChild(P);
}
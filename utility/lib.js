
const getRooms = (socket) => {
  let nsp = socket.nsp.name
  let rooms = Object.keys(socket.rooms);
  for (let i = 0; i < rooms.length; i++) {
    rooms[i] = rooms[i].replace(nsp + "#", '')
  }
  return rooms;
}

const getId = (socket) => {
  let id = socket.id;
  let nsp = socket.nsp.name
  id = id.replace(nsp + "#", '')
  return id;
}

module.exports.getRoom = getRooms;
module.exports.getId = getId;
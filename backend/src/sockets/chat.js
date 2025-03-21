import { createMessage } from '../utils/functions.js';

export const initializeChatHandlers = io => {
  io.on('connection', socket => {
    socket.on('global-message', text => {
      const messageData = createMessage(socket.id, text, socket.data.user.username);

      io.emit('global-message', messageData);
    });

    socket.on('private-message', (recipient, text) => {
      const messageData = createMessage(
        socket.id,
        text,
        socket.data.user.username,
        recipient
      );

      socket.to(recipient).emit('private-message', messageData);
      socket.emit('private-message', messageData);
    });

    socket.on('room-message', (roomName, text) => {
      const messageData = createMessage(
        socket.id,
        text,
        socket.data.user.username,
        roomName
      );

      io.to(roomName).emit('room-message', messageData);
    });
  });
};

import { Server } from 'socket.io';
import { CLIENT_URL } from '../config/env.js';

import { initializeChatHandlers } from './chat.js';
import { initializeRoomHandlers } from './room.js';
import { createMessage, serializeUsers } from '../utils/functions.js';

let io;
const connectedUsers = new Map();

export const initializeSocket = server => {
  io = new Server(server, {
    cors: {
      origin: CLIENT_URL ?? 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', socket => {
    socket.data.user = { id: socket.id, username: socket.id.substring(0, 8) };

    connectedUsers.set(socket.id, socket.data.user);
    updateSockets();

    socket.emit('user', socket.data.user);

    socket.on('username-update', newUsername => {
      if (newUsername.trim() === '') return;
      if (newUsername.trim() === socket.data.user.username) return;
      if (newUsername.trim().length > 10) return;
      
      const oldUsername = socket.data.user.username;
      socket.data.user.username = newUsername;
      connectedUsers.set(socket.id, socket.data.user);
      updateSockets();

      const messageData = createMessage(
        'system',
        `${oldUsername} changed their username to ${newUsername}`,
        'system'
      );

      socket.emit('user', socket.data.user);
      io.emit('global-message', messageData);
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
      updateSockets();
    });
  });

  initializeChatHandlers(io);
  initializeRoomHandlers(io);

  return io;
};

const updateSockets = () => {
  io.emit('users', serializeUsers(connectedUsers));
};

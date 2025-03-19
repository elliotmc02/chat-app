import { Server } from 'socket.io';
import { CLIENT_URL } from '../config/env.js';

import { initializeChatHandlers } from './chat.js';
import { initializeRoomHandlers } from './room.js';

let io;
const connectedUsers = new Set();

export const initializeSocket = server => {
  io = new Server(server, {
    cors: {
      origin: CLIENT_URL ?? 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', socket => {
    connectedUsers.add(socket.id);
    updateSockets();

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
  io.emit('users', [...connectedUsers]);
}
import { Server } from 'socket.io';
import { CLIENT_URL } from '../config/env.js';

import { chatSocket } from './chat.js';
import { roomSocket } from './room.js';

let io;
const sockets = new Set();

export const initializeSocket = server => {
  io = new Server(server, {
    cors: {
      origin: CLIENT_URL ?? 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', socket => {
    sockets.add(socket.id);
    updateSockets();

    socket.on('disconnect', () => {
      sockets.delete(socket.id);
      updateSockets();
    });
  });

  chatSocket();
  roomSocket();

  const updateSockets = () => {
    io.emit('users', [...sockets]);
  }

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

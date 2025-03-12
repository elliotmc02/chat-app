import { Server } from 'socket.io';
import { CLIENT_URL } from '../config/env.js';

import { chatSocket } from './chat.js';

let io;

export const initializeSocket = server => {
  io = new Server(server, {
    cors: {
      origin: CLIENT_URL ?? 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', socket => {
    console.log(`User connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  chatSocket();

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

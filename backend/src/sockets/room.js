import { createMessage, serializeRooms } from '../utils/functions.js';

export const initializeRoomHandlers = io => {
  const rooms = new Map();

  io.on('connection', socket => {
    socket.on('disconnect', () => {
      rooms.forEach((users, roomName) => {
        if (users.has(socket.id)) {
          const messageData = createMessage(
            'system',
            `User ${socket.data.user.username} left the room`,
            'system',
            roomName
          );

          users.delete(socket.id);
          io.to(roomName).emit('room-message', messageData);

          if (users.size === 0) {
            rooms.delete(roomName);

            const globalMessage = createMessage(
              'system',
              `Room ${roomName} was deleted`,
              'system'
            );

            io.emit('global-message', globalMessage);
          }
        }
      });
    });

    socket.on('create-room', roomName => {
      if (rooms.has(roomName)) {
        socket.emit('room-exists');
        return;
      }
      
      rooms.set(roomName, new Set([socket.id]));
      socket.join(roomName);

      const messageData = createMessage(
        'system',
        `User ${socket.data.user.username} created room ${roomName}`,
        'system'
      );

      io.emit('global-message', messageData);
      socket.emit('rooms', serializeRooms(rooms));
      socket.emit('room-created', roomName);
    });

    socket.on('join-room', roomName => {
      if (!rooms.has(roomName)) {
        socket.emit('room-not-found');
        return;
      }

      if (rooms.get(roomName).has(socket.id)) {
        socket.emit('already-in-room');
        return;
      }

      socket.join(roomName);
      rooms.get(roomName).add(socket.id);

      const messageData = createMessage(
        'system',
        `User ${socket.data.user.username} joined room ${roomName}`,
        'system',
        roomName
      );

      io.to(roomName).emit('room-message', messageData);
      socket.emit('rooms', serializeRooms(rooms));
      socket.emit('room-joined', roomName);
    });
  });
};

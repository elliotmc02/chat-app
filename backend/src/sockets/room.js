import { createMessage, serializeRooms } from "../utils/functions.js";

export const initializeRoomHandlers = (io) => {
    const rooms = new Map();

    io.on('connection', socket => {
        socket.on('disconnect', () => {
            rooms.forEach((users, roomName) => {
                if (users.has(socket.id)) {
                    const messageData = createMessage('Server', `User ${socket.id} left the room`, roomName);
                    
                    users.delete(socket.id);
                    io.to(roomName).emit('room-message', messageData);

                    if (users.size === 0) {
                        rooms.delete(roomName);

                        const globalMessage = createMessage('Server', `Room ${roomName} was deleted`);

                        io.emit('global-message', globalMessage)
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

            const messageData = createMessage('Server', `User ${socket.id} created room ${roomName}`);

            socket.emit('rooms', serializeRooms(rooms));
            io.emit('global-message', messageData);
            socket.emit('room-created', roomName);
        });

        socket.on('join-room', roomName => {
            if (!rooms.has(roomName)) {
                socket.emit('room-not-found');
                return;
            }
            socket.join(roomName);
            rooms.get(roomName).add(socket.id);

            const messageData = createMessage('Server', `User ${socket.id} joined room ${roomName}`, roomName);

            socket.emit('rooms', serializeRooms(rooms));
            io.to(roomName).emit('room-message', messageData);
            socket.emit('room-joined', roomName);
        })
    })
}
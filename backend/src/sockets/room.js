import { getIO } from "./index.js";

export const roomSocket = () => {
    const io = getIO();

    const rooms = new Set();

    io.on('connection', socket => {
        socket.on('create-room', roomName => {
            if (rooms.has(roomName)) {
                socket.emit('room-exists');
                return;
            }

            const now = new Date();

            const messageData = {
                sender: 'Server',
                text: `User ${socket.id} created room ${roomName}`,
                date: new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(now),
                time: new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(now)
            }

            rooms.add(roomName);
            socket.join(roomName);
            io.emit('rooms', [...rooms]);
            io.emit('global-message', messageData);
        });

        socket.on('join-room', roomName => {
            socket.join(roomName);
            const now = new Date();

            const messageData = {
                sender: 'Server',
                text: `User ${socket.id} joined the room`,
                date: new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(now),
                time: new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(now)
            }

            io.to(roomName).emit('private-message', messageData);
        })
    })
}
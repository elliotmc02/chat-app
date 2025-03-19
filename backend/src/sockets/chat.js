import { createMessage } from "../utils/functions.js";

export const initializeChatHandlers = (io) => {
    io.on('connection', socket => {
        socket.on('global-message', text => {
            const messageData = createMessage(socket.id, text);

            io.emit('global-message', messageData);
        });

        socket.on('private-message', (recipient, text) => {
            const messageData = createMessage(socket.id, text, recipient);

            socket.to(recipient).emit('private-message', messageData);
            socket.emit('private-message', messageData);
        })

        socket.on('room-message', (roomName, text) => {
            const messageData = createMessage(socket.id, text, roomName);
            
            io.to(roomName).emit('room-message', messageData);
        })
    })
}
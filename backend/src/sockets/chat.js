import { getIO } from "./index.js";

export const chatSocket = () => {
    const io = getIO();

    io.on('connection', socket => {
        socket.on('global-message', text => {
            const now = new Date();
            
            io.emit('global-message', {
                sender: socket.id,
                text: text,
                date: new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(now),
                time: new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(now)
            });
        });
    })
}
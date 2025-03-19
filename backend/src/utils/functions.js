export const createMessage = (sender, text, recipient = null) => {
    const now = new Date();

    return {
        sender,
        text,
        recipient,
        ...formatDateTime(now)
    }
}

const formatDateTime = date => ({
    date: new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date),
    time: new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(date)
});

export const serializeRooms = rooms => (
    [...rooms].map(([roomName, users]) => ({
        roomName,
        users: [...users]
    }))
);
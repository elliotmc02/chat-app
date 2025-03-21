export const createMessage = (
  sender,
  text,
  senderUsername = null,
  recipient = null
) => {
  const now = new Date();

  return {
    sender,
    senderUsername,
    text,
    recipient,
    ...formatDateTime(now),
  };
};

const formatDateTime = date => ({
  date: new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
    date
  ),
  time: new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(date),
});

export const serializeRooms = rooms =>
  [...rooms].map(([roomName, users]) => ({
    roomName,
    users: [...users],
  }));

// eslint-disable-next-line no-unused-vars
export const serializeUsers = users => [...users].map(([_, user]) => user);

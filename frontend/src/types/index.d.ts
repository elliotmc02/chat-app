export type User = {
  id: string;
  username: string;
};

export type Message = {
  sender: string;
  text: string;
  date: string;
  time: string;
  senderUsername?: string;
  recipient?: string;
};

export type Room = {
  roomName: string;
  users: string[];
};

export type Type = 'global' | 'user' | 'room';

export type Chat = {
  id: string;
  type: Type;
  user?: User;
};

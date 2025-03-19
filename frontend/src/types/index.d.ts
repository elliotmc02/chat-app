export type Message = {
  sender: string;
  text: string;
  date: string;
  time: string;
  recipient?: string;
};

export type Room = {
  roomName: string;
  users: string[];
};

export type Type = 'global' | 'user' | 'room';

export type Chat = {
  chat: string;
  type: Type;
};

import { Message } from '@/types';

export const saveMessages = (key: string, messages: Message[]) => {
  sessionStorage.setItem(key, JSON.stringify(messages));
};

export const updateMessages = (key: string, message: Message) => {
  const storedMessages = sessionStorage.getItem(key);
  let updatedMessages: Message[] = [];

  if (storedMessages) {
    updatedMessages = [...JSON.parse(storedMessages), message];
  } else {
    updatedMessages = [message];
  }

  saveMessages(key, updatedMessages);
};

export const dispatchEvent = (eventName: string) => window.dispatchEvent(new Event(eventName));

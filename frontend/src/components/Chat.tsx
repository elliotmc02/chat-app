import { socket } from '@/socket';
import { Message } from '@/types';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelectedChatStore } from '@/stores/selected-chat';
import { saveMessages, updateMessages } from '@/utils/functions';

export const Chat = () => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { selectedChat } = useSelectedChatStore();

  const storageKey = useMemo(() => selectedChat.id || 'global', [selectedChat]);
  
  const memoizedMessages = useMemo(
    () =>
      messages.map((data, index) => (
        <MessageBubble
          key={index}
          message={data}
          prevSender={messages[index - 1]?.sender}
          isCurrentUser={data.sender === socket.id}
        />
      )),
    [messages]
  );

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      if (selectedChat.type === 'user') {
        socket.emit('private-message', selectedChat.id, message);
      } else if (selectedChat.type === 'room') {
        socket.emit('room-message', selectedChat.id, message);
      } else {
        socket.emit('global-message', message);
      }
      setMessage('');
    }
  };

  useEffect(() => {
    setMessages([]);
    const storedMessages = sessionStorage.getItem(storageKey);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, [storageKey]);

  useEffect(() => {
    saveMessages(storageKey, messages);
  }, [messages, storageKey]);

  const onGlobalMessage = useCallback(
    (data: Message) => {
      if (selectedChat.type === 'global') {
        setMessages(prevMessages => [...prevMessages, data]);
      } else {
        updateMessages('global', data);
      }
    },
    [selectedChat]
  );

  const onPrivateMessage = useCallback(
    (data: Message) => {
      if (
        (data.sender === selectedChat.id && selectedChat.type === 'user') ||
        (data.recipient === selectedChat.id && selectedChat.type === 'user')
      ) {
        setMessages(prevMessages => [...prevMessages, data]);
      } else {
        updateMessages(data.sender, data);
      }
    },
    [selectedChat]
  );

  const onRoomMessage = useCallback(
    (data: Message) => {
      if (data.recipient === selectedChat.id && selectedChat.type === 'room') {
        setMessages(prevMessages => [...prevMessages, data]);
      } else {
        if (!data.recipient) return;
        updateMessages(data.recipient, data);
      }
    },
    [selectedChat]
  );

  useEffect(() => {
    const onConnect = () => setIsConnected(true);

    const onDisconnect = () => setIsConnected(false);

    if (socket.connected) onConnect();

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('global-message', onGlobalMessage);
    socket.on('private-message', onPrivateMessage);
    socket.on('room-message', onRoomMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('global-message', onGlobalMessage);
      socket.off('private-message', onPrivateMessage);
      socket.off('room-message', onRoomMessage);
    };
  }, [onGlobalMessage, onPrivateMessage, onRoomMessage]);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 w-full flex flex-col items-center justify-center rounded-xl sm:rounded-l-none">
      {!isConnected || !socket.id ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-t-4 border-blue-600 dark:border-teal-500 border-solid rounded-full animate-spin"></div>
          <p className="text-lg text-gray-800 dark:text-white">Connecting...</p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl text-gray-900 dark:text-white uppercase my-5 font-bold select-none">
            {selectedChat.name}
          </h1>
          <div className="flex flex-col h-full w-full overflow-y-auto my-4">
            {memoizedMessages}
          </div>
          <form
            onSubmit={sendMessage}
            className="flex justify-end gap-3 w-full border-t-3 p-4"
          >
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="bg-white border-gray-300 rounded-lg px-2 py-0.5 w-full outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 dark:bg-teal-700 text-white px-2 rounded-md font-medium hover:bg-blue-700 dark:hover:bg-teal-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 cursor-pointer transition-colors"
              disabled={!isConnected}
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
};

const MessageBubble = ({
  message,
  prevSender,
  isCurrentUser,
}: {
  message: Message;
  prevSender: string | undefined;
  isCurrentUser: boolean;
}) => {
  const isEqualSender = prevSender === message.sender;

  return (
    <div
      className={`px-3 ${isEqualSender ? 'pt-0.5 mt-0' : 'pt-2 mt-2'} ${
        isCurrentUser ? 'self-end' : 'self-start'
      }`}
    >
      <div className="flex flex-col">
        {!isEqualSender && (
          <div
            className={`flex gap-2 ${
              isCurrentUser ? 'justify-start flex-row-reverse' : 'justify-start'
            } items-center`}
          >
            <span
              className={`text-xs font-medium ${
                isCurrentUser
                  ? 'text-blue-700 dark:text-teal-200'
                  : 'text-gray-800 dark:text-gray-300'
              }`}
            >
              {isCurrentUser ? 'You' : message.senderUsername}
            </span>
            <span
              className={`text-xs ${
                isCurrentUser
                  ? 'text-blue-600 dark:text-teal-200'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {message.time}
            </span>
          </div>
        )}
        <span
          className={`px-1.5 py-1 ${
            isCurrentUser
              ? `bg-blue-500 dark:bg-teal-800 text-white ${
                  isEqualSender ? 'rounded-xl' : 'rounded-xl rounded-tr-none'
                }`
              : `bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  isEqualSender ? 'rounded-xl' : 'rounded-xl rounded-tl-none'
                }`
          }`}
        >
          {message.text}
        </span>
      </div>
    </div>
  );
};

import { socket } from '@/socket';
import { Message } from '@/types';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelectedUserStore } from '@/stores/selected-user';
import { saveMessages, updateMessages } from '@/utils/functions';

export const Chat = () => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { selectedUser } = useSelectedUserStore();

  const storageKey = useMemo(() => selectedUser || 'global', [selectedUser]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      if (selectedUser) {
        socket.emit('private-message', selectedUser, message);
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

  const onConnect = useCallback(() => {
    setIsConnected(true);
  }, []);

  const onDisconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  const onGlobalMessage = useCallback(
    (data: Message) => {
      if (!selectedUser) {
        setMessages(prevMessages => [...prevMessages, data]);
      } else {
        updateMessages('global', data);
      }
    },
    [selectedUser]
  );

  const onPrivateMessage = useCallback(
    (data: Message) => {
      if (data.sender === selectedUser || data.recipient === selectedUser) {
        setMessages(prevMessages => [...prevMessages, data]);
      } else {
        updateMessages(data.sender, data);
      }
    },
    [selectedUser]
  );

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('global-message', onGlobalMessage);
    socket.on('private-message', onPrivateMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('global-message', onGlobalMessage);
      socket.off('private-message', onPrivateMessage);
    };
  }, [
    selectedUser,
    onConnect,
    onDisconnect,
    onGlobalMessage,
    onPrivateMessage,
  ]);

  return (
    <div className="bg-white dark:bg-gray-800 w-full flex flex-col items-center justify-center">
      {!isConnected || !socket.id ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-t-4 border-blue-500 dark:border-teal-500 border-solid rounded-full animate-spin"></div>
          <p className="text-lg dark:text-white">Connecting...</p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl dark:text-white uppercase my-5 font-bold">
            {selectedUser.substring(0, 5) || 'GLOBAL'}
          </h1>
          <div className="flex flex-col h-full w-full overflow-y-auto my-4">
            {messages.map((data, index) => (
              <MessageBubble
                key={index}
                message={data}
                prevSender={messages[index - 1]?.sender}
                isCurrentUser={data.sender === socket.id}
              />
            ))}
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
              className="dark:bg-white rounded-lg px-2 py-0.5 w-full outline-0"
            />
            <button
              type="submit"
              className="dark:bg-teal-700 dark:text-white px-2 rounded-md disabled:bg-gray-600"
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
      className={`max-w-xs md:max-w-sm px-3 ${
        isEqualSender ? 'pt-0.5 mt-0' : 'pt-2 mt-2'
      } ${isCurrentUser ? 'self-end ml-auto' : 'self-start mr-auto'}`}
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
                  ? 'text-blue-100 dark:text-teal-200'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {isCurrentUser ? 'You' : message.sender.substring(0, 5)}
            </span>
            <span
              className={`text-xs ${
                isCurrentUser
                  ? 'text-blue-100 dark:text-teal-200'
                  : 'text-gray-500 dark:text-gray-400'
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
              : `bg-gray-200 dark:bg-gray-700 dark:text-white ${
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

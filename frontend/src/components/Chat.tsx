import { socket } from '@/socket';
import { Message } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import { useSelectedUserStore } from '@/stores/selected-user';
import { saveMessages, updateMessages } from '@/utils/functions';

export const Chat = () => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { selectedUser } = useSelectedUserStore();

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
    const storageKey = selectedUser || 'global';
    const storedMessages = sessionStorage.getItem(storageKey);
    if (storedMessages) {
      const parsedMessages: Message[] = JSON.parse(storedMessages);
      setMessages(parsedMessages);
    }
  }, [selectedUser]);

  useEffect(() => {
    const storageKey = selectedUser || 'global';
    saveMessages(storageKey, messages);
  }, [messages, selectedUser]);

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
    <div className="bg-white dark:bg-gray-800 w-full rounded-r-xl flex flex-col items-center justify-center">
      {!isConnected || !socket.id ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-t-4 border-blue-500 dark:border-teal-500 border-solid rounded-full animate-spin"></div>
          <p className="text-lg dark:text-white">Connecting...</p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl dark:text-white uppercase my-5">
            {selectedUser || 'Global'}
          </h1>
          <div className="flex flex-col h-full w-full overflow-y-auto my-4">
            {messages.map((data, index) => (
              <div
                key={index}
                className={`max-w-xs md:max-w-sm py-1 px-3 mb-1 ${
                  data.sender === socket.id
                    ? 'self-end ml-auto'
                    : 'self-start mr-auto'
                }`}
              >
                <div className="flex flex-col">
                  <div
                    className={`flex gap-2 ${
                      data.sender === socket.id
                        ? 'justify-start flex-row-reverse'
                        : 'justify-start'
                    } items-center`}
                  >
                    <span
                      className={`text-xs font-medium ${
                        data.sender === socket.id
                          ? 'text-blue-100 dark:text-teal-200'
                          : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {data.sender === socket.id
                        ? 'You'
                        : data.sender.substring(0, 5)}
                    </span>
                    <span
                      className={`text-xs ${
                        data.sender === socket.id
                          ? 'text-blue-100 dark:text-teal-200'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {data.time}
                    </span>
                  </div>
                  <span
                    className={`rounded-xl px-1.5 py-1 ${
                      data.sender === socket.id
                        ? 'bg-blue-500 dark:bg-teal-800 text-white rounded-tr-none'
                        : 'bg-gray-200 dark:bg-gray-700 dark:text-white rounded-tl-none'
                    }`}
                  >
                    {data.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <form
            onSubmit={sendMessage}
            className="flex items-center justify-end gap-3 w-full border-t-3 p-4"
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

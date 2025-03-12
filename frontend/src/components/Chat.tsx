import { socket } from '@/socket';
import { Message } from '@/types';
import { useState, useEffect } from 'react';

export const Chat = () => {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('global-message', message);
      setMessage('');
    }
  };

  useEffect(() => {
    const onConnect = () => {
      setUserId(socket.id);
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onGlobalMessage = (data: Message) => {
      setMessages(prevMessages => [...prevMessages, data]);
    };

    if (socket.connected) {
      onConnect();
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('global-message', onGlobalMessage);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('global-message');
    };
  }, []);

  if (!isConnected || !userId) {
    return (
      <div className="bg-white dark:bg-gray-800 w-1/2 p-4 rounded-xl h-3/4 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-t-4 border-blue-500 dark:border-teal-500 border-solid rounded-full animate-spin"></div>
          <p className="text-lg dark:text-white">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 w-1/2 rounded-xl h-3/4 flex flex-col items-center">
      <h1 className="text-2xl dark:text-white uppercase my-5">Room name</h1>
      <div className="flex flex-col h-full w-full overflow-y-auto my-4">
        {messages.map((data, index) => (
          <div
            key={index}
            className={`max-w-xs md:max-w-sm py-1 px-3 mb-1 ${
              data.sender === userId ? 'self-end ml-auto' : 'self-start mr-auto'
            }`}
          >
            <div className="flex flex-col">
              <div
                className={`flex gap-2 ${
                  data.sender === userId
                    ? 'justify-start flex-row-reverse'
                    : 'justify-start'
                } items-center`}
              >
                <span
                  className={`text-xs font-medium ${
                    data.sender === userId
                      ? 'text-blue-100 dark:text-teal-200'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {data.sender === userId ? 'You' : data.sender.substring(0, 5)}
                </span>
                <span
                  className={`text-xs ${
                    data.sender === userId
                      ? 'text-blue-100 dark:text-teal-200'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {data.time}
                </span>
              </div>
              <span
                className={`rounded-xl px-1.5 py-1 ${
                  data.sender === userId
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
    </div>
  );
};

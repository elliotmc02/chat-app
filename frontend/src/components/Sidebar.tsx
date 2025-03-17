import { memo, useCallback, useEffect, useState } from 'react';
import { socket } from '@/socket';
import { useSelectedUserStore } from '@/stores/selected-user';
import { EllipsisVertical } from 'lucide-react';

export const Sidebar = () => {
  const [users, setUsers] = useState<string[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { selectedUser, setSelectedUser } = useSelectedUserStore();

  const handleChatSelect = useCallback(
    (chatId: string) => {
      setSelectedUser(chatId);
    },
    [setSelectedUser]
  );

  const showModal = () => {
    setIsModalOpen(prev => !prev);
  };

  const createRoom = () => {
    const roomName = prompt('Enter room name');
    if (roomName && roomName?.trim() !== '') {
      socket.emit('create-room', roomName);
      setIsModalOpen(false);
    }
  };

  const onRoomExists = useCallback(() => {
    console.log('Room already exists');
  }, []);

  useEffect(() => {
    const onUsers = (users: string[]) => {
      setUsers(users);
      setLoading(false);
    };

    const onRooms = (rooms: string[]) => {
      setRooms(rooms);
    };

    setLoading(true);

    socket.on('users', onUsers);
    socket.on('rooms', onRooms);
    socket.on('room-exists', onRoomExists);

    return () => {
      socket.off('users', onUsers);
    };
  }, [onRoomExists]);

  return (
    <div className="dark:bg-gray-700 w-1/6 rounded-l-xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-6 relative">
        <h1 className="dark:text-white text-center text-2xl font-bold">
          CHATS
        </h1>
        <button className="dark:text-white cursor-pointer" onClick={showModal}>
          <EllipsisVertical />
        </button>
        {isModalOpen && <Modal onClick={createRoom} />}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-300 mt-4 animate-pulse text-center">
            Loading chats...
          </p>
        </div>
      )}
      
      {!loading && (
        <div className="overflow-y-auto">
          <ChatButton
            isSelected={selectedUser === ''}
            onClick={() => handleChatSelect('')}
            label="Global"
          />
          {users
            .filter(userId => userId != socket.id)
            .map(userId => (
              <ChatButton
                key={userId}
                isSelected={selectedUser === userId}
                onClick={() => handleChatSelect(userId)}
                label={userId.substring(0, 6)}
              />
            ))}
          {rooms.map(room => (
            <ChatButton
              key={room}
              isSelected={selectedUser === room}
              onClick={() => handleChatSelect(room)}
              label={room}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ChatButton = memo(
  ({
    isSelected,
    onClick,
    label,
  }: {
    isSelected: boolean;
    onClick: () => void;
    label: string;
  }) => (
    <button
      className={`p-2 w-full rounded mb-2 dark:text-white cursor-pointer ${
        isSelected
          ? 'dark:bg-teal-800'
          : 'dark:bg-gray-600 dark:hover:bg-teal-600'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  )
);

const Modal = ({ onClick }: { onClick: () => void }) => {
  return (
    <div className="absolute left-0 right-0 top-10 bg-white rounded-md">
      <button
        className="cursor-pointer w-full py-1 font-semibold text-xl"
        onClick={onClick}
      >
        Create room
      </button>
    </div>
  );
};

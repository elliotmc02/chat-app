import { useCallback, useEffect, useMemo, useState } from 'react';
import { socket } from '@/socket';
import { useSelectedChatStore } from '@/stores/selected-chat';
import { EllipsisVertical } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Room, Type } from '@/types';

export const Sidebar = () => {
  const [users, setUsers] = useState<string[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { selectedChat, setSelectedChat } = useSelectedChatStore();

  const filteredUsers = useMemo(
    () => users.filter(userId => userId !== socket.id),
    [users]
  );

  const handleChatSelect = useCallback(
    (chatId: string, type: Type) => {
      setSelectedChat({ chat: chatId, type });
    },
    [setSelectedChat]
  );

  const showModal = () => {
    setIsModalOpen(prev => !prev);
  };

  const createRoom = () => {
    const roomName = prompt('Enter room name');
    if (roomName && roomName?.trim() !== '') {
      socket.emit('create-room', roomName);
      setSelectedChat({ chat: roomName, type: 'room' });
      setIsModalOpen(false);
    }
  };

  const joinRoom = () => {
    const roomName = prompt('Enter room name');
    if (roomName && roomName?.trim() !== '') {
      socket.emit('join-room', roomName);
      setSelectedChat({ chat: roomName, type: 'room' });
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    const onUsers = (users: string[]) => {
      setUsers(users);
      setLoading(false);
    };

    const onRooms = (rooms: Room[]) => {
      setRooms(rooms);
    };

    const onRoomExists = () => {
      toast.error('Room already exists');
    };

    const onRoomNotFound = () => {
      toast.error('Room not found');
    };

    setLoading(true);

    socket.on('users', onUsers);
    socket.on('rooms', onRooms);
    socket.on('room-exists', onRoomExists);
    socket.on('room-not-found', onRoomNotFound);

    return () => {
      socket.off('users', onUsers);
      socket.off('rooms', onRooms);
      socket.off('room-exists', onRoomExists);
      socket.off('room-not-found', onRoomNotFound);
    };
  }, []);

  return (
    <div className="dark:bg-gray-700 w-1/6 rounded-l-xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-6 relative">
        <h1 className="dark:text-white text-center text-2xl font-bold">
          CHATS
        </h1>
        <button className="dark:text-white cursor-pointer" onClick={showModal}>
          <EllipsisVertical />
        </button>
        {isModalOpen && (
          <Modal>
            <ModalButton text="Create room" onClick={createRoom} />
            <ModalButton text="Join room" onClick={joinRoom} />
          </Modal>
        )}
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
            isSelected={selectedChat.type === 'global'}
            onClick={() => handleChatSelect('', 'global')}
            label="Global"
          />
          {filteredUsers.map(userId => (
            <ChatButton
              key={userId}
              isSelected={selectedChat.chat === userId}
              onClick={() => handleChatSelect(userId, 'user')}
              label={userId.substring(0, 6)}
            />
          ))}
          {rooms.map(
            ({ roomName, users }) =>
              socket.id &&
              users.includes(socket.id) && (
                <ChatButton
                  key={roomName}
                  isSelected={selectedChat.chat === roomName}
                  onClick={() => handleChatSelect(roomName, 'room')}
                  label={roomName}
                />
              )
          )}
          <Toaster />
        </div>
      )}
    </div>
  );
};

const ChatButton = ({
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
);

const Modal = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="absolute left-0 right-0 top-10 bg-white rounded-md">
      {children}
    </div>
  );
};

const ModalButton = ({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) => (
  <button
    className="cursor-pointer w-full py-1 font-semibold text-xl"
    onClick={onClick}
  >
    {text}
  </button>
);

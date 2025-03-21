import { useCallback, useEffect, useMemo, useState } from 'react';
import { socket } from '@/socket';
import { useSelectedChatStore } from '@/stores/selected-chat';
import { EllipsisVertical } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Room, Type, User } from '@/types';

export const Sidebar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { selectedChat, setSelectedChat } = useSelectedChatStore();

  const filteredUsers = useMemo(
    () => users.filter(({ id }) => id !== socket.id),
    [users]
  );

  const handleChatSelect = useCallback(
    (chatId: string, type: Type, user?: User) => {
      setSelectedChat({ id: chatId, type, user });
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
      setIsModalOpen(false);
    }
  };

  const joinRoom = () => {
    const roomName = prompt('Enter room name');
    if (roomName && roomName?.trim() !== '') {
      socket.emit('join-room', roomName);
      setIsModalOpen(false);
    }
  };

  const handleUsernameInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUsername(e.target.value);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      updateUsername();
      e.currentTarget.blur();
    }
  };

  const handleBlur = () => updateUsername();

  const updateUsername = () => {
    if (username.trim() === '') {
      setUsername(user?.username || '');
      toast.error('Username cannot be empty');
      return;
    }

    if (username.trim() === user?.username) return;

    if (username.trim().length > 10) {
      setUsername(user?.username || '');
      toast.error('Username cannot be longer than 10 characters');
      return;
    }

    socket.emit('username-update', username);
  };

  useEffect(() => {
    const onUser = (user: User) => {
      setUser(user);
      setUsername(user.username);
    };

    const onUsers = (users: User[]) => {
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

    const onRoomCreated = (roomName: string) => {
      setSelectedChat({ id: roomName, type: 'room' });
    };

    const onRoomJoined = (roomName: string) => {
      setSelectedChat({ id: roomName, type: 'room' });
    };

    setLoading(true);

    socket.on('user', onUser);
    socket.on('users', onUsers);
    socket.on('rooms', onRooms);
    socket.on('room-exists', onRoomExists);
    socket.on('room-not-found', onRoomNotFound);
    socket.on('room-created', onRoomCreated);
    socket.on('room-joined', onRoomJoined);

    return () => {
      socket.off('user', onUser);
      socket.off('users', onUsers);
      socket.off('rooms', onRooms);
      socket.off('room-exists', onRoomExists);
      socket.off('room-not-found', onRoomNotFound);
      socket.off('room-created', onRoomCreated);
      socket.off('room-joined', onRoomJoined);
    };
  }, [setSelectedChat]);

  return (
    <div className="dark:bg-gray-700 w-1/6 rounded-l-xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-6 relative">
        <h1 className="dark:text-white text-center text-2xl font-bold select-none">
          CHATS
        </h1>
        <button
          className="dark:text-white cursor-pointer dark:hover:bg-gray-600 rounded-md"
          onClick={showModal}
        >
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
        <div className="flex flex-col items-center h-full">
          <div className="flex-1 overflow-y-auto w-full">
            <ChatButton
              isSelected={selectedChat.type === 'global'}
              onClick={() => handleChatSelect('', 'global')}
              label="Global"
            />
            {filteredUsers.map(user => (
              <ChatButton
                key={user.id}
                isSelected={selectedChat.id === user.id}
                onClick={() => handleChatSelect(user.id, 'user', user)}
                label={user.username}
              />
            ))}
            {rooms.map(
              ({ roomName, users }) =>
                socket.id &&
                users.includes(socket.id) && (
                  <ChatButton
                    key={roomName}
                    isSelected={selectedChat.id === roomName}
                    onClick={() => handleChatSelect(roomName, 'room')}
                    label={roomName}
                  />
                )
            )}
            <Toaster />
          </div>
          <div className="dark:bg-gray-600 rounded-xl p-2 w-full">
            <h1 className="dark:text-gray-200 font-semibold text-xl select-none">
              Username
            </h1>
            <input
              type="text"
              className="w-full outline-0 rounded-lg dark:text-white dark:hover:bg-gray-700 px-0.5"
              value={username}
              onChange={handleUsernameInput}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
            />
          </div>
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
    <div className="absolute left-0 right-0 top-10 dark:bg-gray-900 rounded-md overflow-hidden">
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
    className="cursor-pointer w-full py-1 font-semibold text-xl dark:hover:bg-gray-600 dark:text-white"
    onClick={onClick}
  >
    {text}
  </button>
);

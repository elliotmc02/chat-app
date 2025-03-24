import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { socket } from '@/socket';
import { useSelectedChatStore } from '@/stores/selected-chat';
import { EllipsisVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { Room, Type, User } from '@/types';
import { dispatchEvent } from '@/utils/functions';

export const Sidebar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { selectedChat, setSelectedChat } = useSelectedChatStore();

  const filteredUsers = useMemo(
    () => users.filter(({ id }) => id !== socket.id),
    [users]
  );

  const handleChatSelect = useCallback(
    (chatId: string, type: Type, user?: User) => {
      setSelectedChat({ id: chatId, type, user });

      if (window.innerWidth < 640) {
        dispatchEvent('sidebarclose');
      }
    },
    [setSelectedChat]
  );

  const showModal = () => {
    setIsModalOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  const createRoom = () => {
    const roomName = prompt('Enter room name');
    setIsModalOpen(false);

    if (roomName === null) return;
    if (roomName?.trim() === '') {
      toast.error('Room name cannot be empty', { id: 'room-empty' });
      return;
    }

    socket.emit('create-room', roomName);
  };

  const joinRoom = () => {
    const roomName = prompt('Enter room name');
    setIsModalOpen(false);

    if (roomName === null) return;
    if (roomName?.trim() === '') {
      toast.error('Room name cannot be empty', { id: 'room-empty' });
      return;
    }

    socket.emit('join-room', roomName);
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
      toast.error('Username cannot be empty', { id: 'username-empty' });
      return;
    }

    if (username.trim() === user?.username) return;

    if (username.trim().length > 10) {
      setUsername(user?.username || '');
      toast.error('Username cannot be longer than 10 characters', {
        id: 'username-length',
      });
      return;
    }

    if (users.some(user => user.username === username)) {
      setUsername(user?.username || '');
      toast.error('Username already taken', { id: 'username-taken' });
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
      toast.error('Room already exists', { id: 'room-exists' });
    };

    const onRoomNotFound = () => {
      toast.error('Room not found', { id: 'room-not-found' });
    };

    const onRoomCreated = (roomName: string) => {
      setSelectedChat({ id: roomName, type: 'room' });
      dispatchEvent('sidebarclose');
    };

    const onRoomJoined = (roomName: string) => {
      setSelectedChat({ id: roomName, type: 'room' });
      dispatchEvent('sidebarclose');
    };

    const onAlreadyInRoom = () => {
      toast.error('You are already in this room', { id: 'already-in-room' });
    };

    setLoading(true);

    socket.on('user', onUser);
    socket.on('users', onUsers);
    socket.on('rooms', onRooms);
    socket.on('room-exists', onRoomExists);
    socket.on('room-not-found', onRoomNotFound);
    socket.on('room-created', onRoomCreated);
    socket.on('room-joined', onRoomJoined);
    socket.on('already-in-room', onAlreadyInRoom);

    return () => {
      socket.off('user', onUser);
      socket.off('users', onUsers);
      socket.off('rooms', onRooms);
      socket.off('room-exists', onRoomExists);
      socket.off('room-not-found', onRoomNotFound);
      socket.off('room-created', onRoomCreated);
      socket.off('room-joined', onRoomJoined);
      socket.off('already-in-room', onAlreadyInRoom);
    };
  }, [setSelectedChat]);

  return (
    <div className="bg-white dark:bg-gray-700 h-full w-full sm:rounded-l-xl p-4 flex flex-col shadow-sm">
      <div className="flex items-center justify-between mb-6 relative">
        <h1 className="text-gray-900 dark:text-white text-center lg:text-2xl md:text-xl sm:text-lg font-bold select-none">
          CHATS
        </h1>
        <button
          ref={buttonRef}
          className="text-gray-700 dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md p-1"
          onClick={showModal}
        >
          <EllipsisVertical />
        </button>
        {isModalOpen && (
          <Modal ref={modalRef}>
            <ModalButton text="Create room" onClick={createRoom} />
            <ModalButton text="Join room" onClick={joinRoom} />
          </Modal>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-300 mt-4 animate-pulse text-center">
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
              label="GLOBAL"
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
          </div>
          <div className="bg-blue-50 dark:bg-gray-600 border border-blue-100 dark:border-gray-500 rounded-xl lg:p-3 md:p-2 sm:p-1 flex flex-col items-center justify-center">
            <h1 className="text-gray-800 dark:text-gray-200 font-semibold lg:text-xl md:text-lg select-none mb-2 text-center">
              Username
            </h1>
            <input
              type="text"
              className="w-full bg-white dark:bg-gray-700 outline-none rounded-lg lg:px-3 lg:py-2 md:px-2 md:py-1 sm:p-1 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 md:text-base text-sm"
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
    className={`md:p-2 p-1 md:text-base text-sm w-full rounded-lg mb-2 font-medium cursor-pointer dark:text-white ${
      isSelected
        ? 'bg-blue-100 text-blue-800 dark:bg-teal-800'
        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-teal-600'
    }`}
    onClick={onClick}
  >
    {label.substring(0, 10)}
  </button>
);

const Modal = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  ({ children }, ref) => {
    return (
      <div
        ref={ref}
        className="absolute left-0 right-0 top-10 bg-white dark:bg-gray-900 rounded-md overflow-hidden shadow-lg border border-gray-200 dark:border-gray-600 z-20"
      >
        {children}
      </div>
    );
  }
);

const ModalButton = ({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) => (
  <button
    className="cursor-pointer w-full lg:py-2 md:py-1 lg:px-4 md:px-1 font-medium text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
    onClick={onClick}
  >
    {text}
  </button>
);

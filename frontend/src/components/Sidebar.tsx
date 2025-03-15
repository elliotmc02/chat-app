import { memo, useCallback, useEffect, useState } from 'react';
import { socket } from '@/socket';
import { useSelectedUserStore } from '@/stores/selected-user';
import { EllipsisVertical } from 'lucide-react';

export const Sidebar = () => {
  const [users, setUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { selectedUser, setSelectedUser } = useSelectedUserStore();

  const handleChatSelect = useCallback(
    (chatId: string) => {
      setSelectedUser(chatId);
    },
    [setSelectedUser]
  );

  useEffect(() => {
    const onUsers = (users: string[]) => {
      setUsers(users);
      setLoading(false);
    };

    setLoading(true);

    socket.on('users', onUsers);

    return () => {
      socket.off('users', onUsers);
    };
  }, []);

  return (
    <div className="dark:bg-gray-700 w-1/6 rounded-l-xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="dark:text-white text-center text-2xl font-bold">
          CHATS
        </h1>
        <button className="dark:text-white cursor-pointer">
          <EllipsisVertical />
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-300 mt-4 animate-pulse text-center">
            Loading users...
          </p>
        </div>
      )}

      {!loading && (
        <div className="overflow-y-auto">
          <UserButton
            isSelected={selectedUser === ''}
            onClick={() => handleChatSelect('')}
            label="Global"
          />
          {users
            .filter(userId => userId != socket.id)
            .map(userId => (
              <UserButton
                isSelected={selectedUser === userId}
                onClick={() => handleChatSelect(userId)}
                label={userId.substring(0, 5)}
              />
            ))}
        </div>
      )}
    </div>
  );
};

const UserButton = memo(
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

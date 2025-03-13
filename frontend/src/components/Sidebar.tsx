import { useEffect, useState } from 'react';
import { socket } from '@/socket';
import { useSelectedUserStore } from '@/stores/selected-user';

export const Sidebar = () => {
  const [users, setUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { setSelectedUser } = useSelectedUserStore();

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
      <h1 className="dark:text-white text-center text-2xl font-bold mb-6">
        USERS
      </h1>

      {loading && (
        <div className="flex flex-col items-center justify-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-300 mt-4 animate-pulse">Loading users...</p>
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="text-gray-400 text-center py-8 italic">
          No users connected
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="overflow-y-auto">
          <div
            className="dark:bg-gray-600 p-2 rounded mb-2 dark:text-white"
            onClick={() => setSelectedUser('')}
          >
            Global
          </div>
          {users
            .filter(userId => userId != socket.id)
            .map(userId => (
              <div
                key={userId}
                className="dark:bg-gray-600 p-2 rounded mb-2 dark:text-white"
                onClick={() => setSelectedUser(userId)}
              >
                {userId.substring(0, 5)}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

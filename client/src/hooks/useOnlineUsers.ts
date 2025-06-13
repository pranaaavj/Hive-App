import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';

export const useOnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    socket.on('onlineUsers', (userIds: string[]) => {
      setOnlineUsers(userIds);
    });

    socket.on('userOnline', (userId: string) => {
      setOnlineUsers((prev) => Array.from(new Set([...prev, userId])));
    
    });

    socket.on('userOffline', (userId: string) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    socket.emit('requestOnlineUsers');

    return () => {
      socket.off('onlineUsers');
      socket.off('userOnline');
      socket.off('userOffline');
    };
  }, []);

  return { onlineUsers };
};

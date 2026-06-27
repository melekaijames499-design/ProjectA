import React, { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let socketInstance = null;

    if (isAuthenticated && user) {
      const serverUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      
      console.log('Connecting to Socket.io server at:', serverUrl);
      socketInstance = io(serverUrl, {
        transports: ['websocket', 'polling'],
        withCredentials: true
      });

      socketInstance.on('connect', () => {
        console.log('Connected to real-time socket:', socketInstance.id);
        
        // Joins rooms based on roles
        if (user.role === 'admin') {
          socketInstance.emit('join_admin_room');
        }
        
        if (user.farmId) {
          socketInstance.emit('join_farm_room', { farmId: user.farmId });
        }
      });

      setSocket(socketInstance);
    }

    // Cleanup: disconnect on logout or unmount
    return () => {
      if (socketInstance) {
        console.log('Disconnecting socket...');
        socketInstance.disconnect();
      }
      setSocket(null);
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

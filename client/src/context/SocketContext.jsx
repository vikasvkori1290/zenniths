import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Dynamically resolve backend URL for dev vs. production
    const SERVER_URL = import.meta.env.MODE === 'development'
      ? 'http://localhost:5000'
      : import.meta.env.VITE_API_URL;

    // Connect to the backend Socket.io server
    socketRef.current = io(SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'], // Allow polling fallback in production
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
      console.log('🔌 Socket connected');
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
      console.log('❌ Socket disconnected');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>');
  return ctx;
};

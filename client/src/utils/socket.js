import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '')
  || 'http://localhost:5000';

// Singleton socket instance
let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(URL, {
      autoConnect:   false,
      withCredentials: true,
    });
  }
  return socket;
};

export const connectSocket = (userId) => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.emit('join', userId);
  }
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};
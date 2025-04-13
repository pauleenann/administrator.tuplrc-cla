// src/socket.js
import { io } from 'socket.io-client';

// Replace with your backend URL
const SOCKET_URL = 'http://localhost:3001'; 

const socket = io(SOCKET_URL, {
  autoConnect: false, // Optional: prevent auto connect
  withCredentials: true,
});

export default socket;

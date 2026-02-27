import { io } from "socket.io-client";

// socket url == backend url
const SOCKET_URL : string = import.meta.env.VITE_ENVIRONMENT || 'http://localhost:3000';

// export initialized socket object to easily use it everywhere
export const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true
})
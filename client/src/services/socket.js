import { io } from "socket.io-client";

// In production, this should be an environment variable.
const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const socket = io(socketUrl, {
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ["websocket"]
});

export default socket;

import { io } from "socket.io-client";

// Aumente a resiliência da conexão
const socket = io("https://vandora-backend.onrender.com", {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket'] // Força o uso de WebSocket puro
});

// Adicione este log para ver se a conexão cai e volta
socket.on("connect", () => {
    console.log("🔥 Socket Conectado com ID:", socket.id);
});

export default socket;
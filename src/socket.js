import io from "socket.io-client";
export const API_URL = "https://vandora-backend.onrender.com";

const socket = io(`${API_URL}`, {
    transports: ["websocket"],
    autoConnect: true
});
  

export default socket;
import { io } from "socket.io-client"
import { BACKEND_URL } from "./confg";

// export const socket = io("https://vaccinal-cushionless-donnell.ngrok-free.dev", {
export const socket = io(`${BACKEND_URL}`, {
  transports: ["websocket"],  
});
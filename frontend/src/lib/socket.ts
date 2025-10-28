import { io } from "socket.io-client"

export const socket = io("https://vaccinal-cushionless-donnell.ngrok-free.dev", {
  transports: ["websocket"],  // force websocket upgrade
});

import { Server } from "socket.io";

export const setupSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.onAny((event, ...args) => {
      console.log("EVENT RECEIVED:", event, args);
    });

    socket.on("send-message", (message) => {
      console.log("Message received:", message);

      socket.broadcast.emit("receive-message", message);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};
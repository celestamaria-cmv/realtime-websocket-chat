import { Server } from "socket.io";

export const setupSocket = (io: Server) => {
  const users = new Map();

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-chat", (username) => {
      console.log(`${username} joined the chat`);

      // Store username using socket ID
      users.set(socket.id, username);

      // Tell everyone except the person who joined
      socket.broadcast.emit("user-joined", username);
    });

    socket.onAny((event, ...args) => {
      console.log("EVENT RECEIVED:", event, args);
    });

    socket.on("send-message", (message) => {
      console.log("Message received:", message);

      socket.broadcast.emit("receive-message", message);
    });

    socket.on("disconnect", () => {
      // Find the username using the socket ID
      const username = users.get(socket.id);

      console.log("Disconnected socket:", socket.id);
      console.log("Username who left:", username);

      // Remove the user from the Map
      users.delete(socket.id);

      // Tell the other users
      socket.broadcast.emit("user-left", username);

      console.log(`Sent user-left event for: ${username}`);
    });
  });
};
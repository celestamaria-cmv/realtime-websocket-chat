import { Server } from "socket.io";

export const setupSocket = (io: Server) => {
  const users = new Map();

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-chat", (username) => {
      console.log(`${username} joined the chat`);

      users.set(socket.id, username);

      socket.broadcast.emit("user-joined", username);

      const onlineUsers = Array.from(users.values());

      io.emit("online-users", onlineUsers);
    });

    socket.onAny((event, ...args) => {
      console.log("EVENT RECEIVED:", event, args);
    });

    socket.on("send-message", (message) => {
      console.log("Message received:", message);

      socket.broadcast.emit("receive-message", message);
    });

    // Day 7: A user starts typing
    socket.on("typing", () => {
      const username = users.get(socket.id);

      socket.broadcast.emit("user-typing", username);
    });

    // Day 7: A user stops typing
    socket.on("stop-typing", () => {
      const username = users.get(socket.id);

      socket.broadcast.emit("user-stop-typing", username);
    });

    socket.on("disconnect", () => {
      const username = users.get(socket.id);

      console.log("Disconnected socket:", socket.id);
      console.log("Username who left:", username);

      users.delete(socket.id);

      socket.broadcast.emit("user-left", username);

      const onlineUsers = Array.from(users.values());

      io.emit("online-users", onlineUsers);

      console.log("Online users:", onlineUsers);
    });
  });
};
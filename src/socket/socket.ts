import { Server } from "socket.io";

export const setupSocket = (io: Server) => {
  const users = new Map();

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-chat", (username) => {
      console.log(`${username} joined the chat`);

      // Store username using socket ID
      users.set(socket.id, username);

      // Tell other users that someone joined
      socket.broadcast.emit("user-joined", username);

      // Get all currently online usernames
      const onlineUsers = Array.from(users.values());

      // Send the current online-user list to everyone
      io.emit("online-users", onlineUsers);
    });

    socket.onAny((event, ...args) => {
      console.log("EVENT RECEIVED:", event, args);
    });

    socket.on("send-message", (message) => {
      console.log("Message received:", message);

      socket.broadcast.emit("receive-message", message);
    });

    socket.on("disconnect", () => {
      // Find the username
      const username = users.get(socket.id);

      console.log("Disconnected socket:", socket.id);
      console.log("Username who left:", username);

      // Remove the user
      users.delete(socket.id);

      // Tell other users that someone left
      socket.broadcast.emit("user-left", username);

      // Get updated online users
      const onlineUsers = Array.from(users.values());

      // Send updated list to everyone
      io.emit("online-users", onlineUsers);

      console.log("Online users:", onlineUsers);
    });
  });
};
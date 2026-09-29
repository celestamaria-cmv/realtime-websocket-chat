
import { io } from "socket.io-client";

const username = process.argv[2] || "Alice";

const socket = io("http://localhost:5001");

socket.on("connect", () => {
  console.log("Connected to server:", socket.id);

  socket.on("receive-message", (message) => {
    console.log("Received message:", message);
  });

  socket.on("user-joined", (username) => {
    console.log(`🔵 ${username} joined the chat`);
  });

  socket.on("user-left", (username) => {
    console.log(`🔴 ${username} left the chat`);
  });

  // Tell the server our username
  socket.emit("join-chat", username);

  console.log("About to send message...");

  socket.emit("send-message", {
    username: username,
    message: "Hello from " + username + "!"
  });
});
import { io } from "socket.io-client";
const username = process.argv[2] || "Alice";
const socket = io("http://localhost:5001");

socket.on("connect", () => {
  console.log("Connected to server:", socket.id);

  socket.on("receive-message", (message) => {
    console.log("Received message:", message);
  });
  console.log("About to send message...");
  socket.emit("send-message", {
  username: username,
  message: "Hello from " + username + "!"
});
});
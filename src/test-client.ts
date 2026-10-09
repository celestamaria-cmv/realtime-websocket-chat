import { io } from "socket.io-client";

const username = process.argv[2] || "Alice";

const socket = io("http://localhost:5001");

let typingTimer: ReturnType<typeof setTimeout>;

// Track whether the user is already typing
let isTyping = false;

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

  socket.on("online-users", (users) => {
    console.log("🟢 Online users:", users);
  });

  socket.on("user-typing", (username) => {
    console.log(`💬 ${username} is typing...`);
  });

  socket.on("user-stop-typing", (username) => {
    console.log(`💬 ${username} stopped typing.`);
  });

  socket.emit("join-chat", username);

  console.log("About to send message...");

  socket.emit("send-message", {
    username: username,
    message: "Hello from " + username + "!"
  });
});

// Simulate typing activity
function simulateTyping() {
  // Send "typing" only when typing starts
  if (!isTyping) {
    isTyping = true;
    socket.emit("typing");
    console.log("Started typing...");
  }

  // Reset the timer every time typing activity occurs
  clearTimeout(typingTimer);

  typingTimer = setTimeout(() => {
    isTyping = false;
    socket.emit("stop-typing");
    console.log("Stopped typing after 1 second of inactivity.");
  }, 1000);
}

// Simulate a user typing several times
setTimeout(() => simulateTyping(), 1000);
setTimeout(() => simulateTyping(), 1500);
setTimeout(() => simulateTyping(), 2000);
setTimeout(() => simulateTyping(), 2500);
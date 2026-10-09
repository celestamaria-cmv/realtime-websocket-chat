import { io } from "socket.io-client";

const username = process.argv[2] || "Alice";

const socket = io("http://localhost:5001");

let typingTimer: ReturnType<typeof setTimeout>;
let isTyping = false;

interface ChatMessage {
  _id?: string;
  username: string;
  message: string;
  createdAt?: string;
}

interface MessageError {
  message: string;
}

socket.on("connect", async () => {
  console.log("Connected to server:", socket.id);

  // Receive new real-time messages
  socket.on("receive-message", (message: ChatMessage) => {
    console.log("Received message:", message);
  });

  // Receive join and leave notifications
  socket.on("user-joined", (joinedUsername: string) => {
    console.log(`🔵 ${joinedUsername} joined the chat`);
  });

  socket.on("user-left", (leftUsername: string) => {
    console.log(`🔴 ${leftUsername} left the chat`);
  });

  // Receive the online-user list
  socket.on("online-users", (users: string[]) => {
    console.log("🟢 Online users:", users);
  });

  // Receive typing notifications
  socket.on("typing", (typingUsername: string) => {
    console.log(`💬 ${typingUsername} is typing...`);
  });

  socket.on("stop-typing", (typingUsername: string) => {
    console.log(`💬 ${typingUsername} stopped typing.`);
  });

  // Receive errors when saving messages fails
  socket.on("message-error", (error: MessageError) => {
    console.error("Message error:", error.message);
  });

  // Tell the server our username
  socket.emit("join-chat", username);

  // Load previously saved messages
  try {
    const response = await fetch(
      "http://localhost:5001/api/messages"
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const messages: ChatMessage[] = await response.json();

    console.log("\n📚 Previous chat history:");

    if (messages.length === 0) {
      console.log("No previous messages.");
    } else {
      messages.forEach((message) => {
        console.log(
          `[History] ${message.username}: ${message.message}`
        );
      });
    }

    console.log("📚 End of chat history\n");
  } catch (error) {
    console.error("Failed to load chat history:", error);
  }

  // Send a test message
  console.log("About to send message...");

  socket.emit("send-message", {
    username,
    message: "Hello from " + username + "!"
  });
});

// Simulate typing activity with debouncing
function simulateTyping() {
  if (!isTyping) {
    isTyping = true;
    socket.emit("typing");
    console.log("Started typing...");
  }

  clearTimeout(typingTimer);

  typingTimer = setTimeout(() => {
    isTyping = false;
    socket.emit("stop-typing");
    console.log("Stopped typing after 1 second of inactivity.");
  }, 1000);
}

// Simulate typing several times
setTimeout(() => simulateTyping(), 1000);
setTimeout(() => simulateTyping(), 1500);
setTimeout(() => simulateTyping(), 2000);
setTimeout(() => simulateTyping(), 2500);
import { Server } from "socket.io";
import Message from "../models/Message";
export const setupSocket = (io: Server) => {
  const users = new Map<string, string>();
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    // User joins the chat
    socket.on("join-chat", (username: string) => {
      if (typeof username !== "string" || !username.trim()) {
        socket.emit("message-error", {
          message: "A valid username is required.",
        });
        return;
      }
      const cleanUsername = username.trim().slice(0, 30);
      users.set(socket.id, cleanUsername);
      console.log(`${cleanUsername} joined the chat`);
      socket.broadcast.emit("user-joined", cleanUsername);
      io.emit("online-users", Array.from(users.values()));
    });
    // Send the current online-user list
    socket.emit("online-users", Array.from(users.values()));
    // Receive, validate, save, and broadcast messages
    socket.on("send-message", async (data) => {
      try {
        const username = users.get(socket.id);
        if (!username) {
          socket.emit("message-error", {
            message: "Please join the chat before sending messages.",
          });
          return;
        }
        const message = data?.message;
        if (typeof message !== "string" || !message.trim()) {
          socket.emit("message-error", {
            message: "Message cannot be empty.",
          });
          return;
        }
        const cleanMessage = message.trim();
        if (cleanMessage.length > 500) {
          socket.emit("message-error", {
            message: "Message cannot exceed 500 characters.",
          });
          return;
        }
        const savedMessage = await Message.create({
          username,
          message: cleanMessage,
          createdAt: new Date(),
        });
        console.log("Message saved to MongoDB:", savedMessage);
        socket.broadcast.emit("receive-message", savedMessage);
      } catch (error) {
        console.error("Failed to save message:", error);
        socket.emit("message-error", {
          message: "Message could not be saved. Please try again.",
        });
      }
    });
    // Typing indicator
    socket.on("typing", () => {
      const username = users.get(socket.id);
      if (username) {
        socket.broadcast.emit("typing", username);
      }
    });
    socket.on("stop-typing", () => {
      const username = users.get(socket.id);
      if (username) {
        socket.broadcast.emit("stop-typing", username);
      }
    });
    // User disconnects
    socket.on("disconnect", () => {
      const username = users.get(socket.id);
      if (username) {
        users.delete(socket.id);
        console.log(`${username} left the chat`);
        socket.broadcast.emit("user-left", username);
      }
      io.emit("online-users", Array.from(users.values()));
      console.log("A user disconnected:", socket.id);
    });
  });
};
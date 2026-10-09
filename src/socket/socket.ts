import { Server } from "socket.io";
import Message from "../models/Message";

export const setupSocket = (io: Server) => {
  // Store the username associated with each connected socket
  const users = new Map<string, string>();

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // DAY 5: User joins the chat
    socket.on("join-chat", (username: string) => {
      users.set(socket.id, username);

      console.log(`${username} joined the chat`);

      socket.broadcast.emit("user-joined", username);
    });

    // DAY 6: Send the current online-user list
    const onlineUsers = Array.from(users.values());

    socket.emit("online-users", onlineUsers);

    socket.broadcast.emit("online-users", onlineUsers);

    // DAY 4 + DAY 8: Receive, save, and broadcast messages
    socket.on("send-message", async (data) => {
      try {
        console.log("Message received:", data);

        // Step 1: Save the message to MongoDB
        const savedMessage = await Message.create({
          username: data.username,
          message: data.message,
          createdAt: new Date(),
        });

        console.log("Message saved to MongoDB:", savedMessage);

        // Step 2: Broadcast the saved message to other clients
        socket.broadcast.emit("receive-message", savedMessage);
      } catch (error) {
        console.error("Failed to save message:", error);

        socket.emit("message-error", {
          message: "Message could not be saved.",
        });
      }
    });

    // DAY 7: Typing indicator
    socket.on("typing", () => {
      socket.broadcast.emit("typing", users.get(socket.id));
    });

    socket.on("stop-typing", () => {
      socket.broadcast.emit("stop-typing", users.get(socket.id));
    });

    // DAY 5 + DAY 6: User disconnects
    socket.on("disconnect", () => {
      const username = users.get(socket.id);

      if (username) {
        users.delete(socket.id);

        console.log(`${username} left the chat`);

        socket.broadcast.emit("user-left", username);
      }

      const updatedOnlineUsers = Array.from(users.values());

      io.emit("online-users", updatedOnlineUsers);

      console.log("A user disconnected:", socket.id);
    });
  });
};
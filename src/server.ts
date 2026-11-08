import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { setupSocket } from "./socket/socket";
import { connectDB } from "./config/db";

const PORT = 5001;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://client-silk-ten.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
  },
});

setupSocket(io);

connectDB();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
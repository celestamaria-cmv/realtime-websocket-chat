import express from "express";
import cors from "cors";
import messageRoutes from "./routes/messageRoutes";

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running"
  });
});

app.use("/api", messageRoutes);

export default app;
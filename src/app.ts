import express from "express";
import messageRoutes from "./routes/messageRoutes";

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running"
  });
});

app.use("/api", messageRoutes);

export default app;
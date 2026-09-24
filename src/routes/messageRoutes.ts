import express from "express";
import { getMessages, createMessage } from "../controllers/MessageController";

const router = express.Router();

router.get("/messages", getMessages);
router.post("/messages", createMessage);

export default router;
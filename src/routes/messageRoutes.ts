import express from "express";
import { getMessages } from "../controllers/MessageController";

const router = express.Router();

router.get("/messages", getMessages);

export default router;
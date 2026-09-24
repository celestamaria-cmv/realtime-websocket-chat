import { Request, Response } from "express";
import Message from "../models/Message";

export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await Message.find();

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch messages"
    });
  }
};


export const createMessage = async (req: Request, res: Response) => {
  try {
    const { username, message } = req.body;

    const newMessage = await Message.create({
      username,
      message,
      createdAt: new Date()
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create message"
    });
  }
};
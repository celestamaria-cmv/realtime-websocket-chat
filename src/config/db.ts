import "dotenv/config";
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env file");
    }

    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB Atlas connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
};
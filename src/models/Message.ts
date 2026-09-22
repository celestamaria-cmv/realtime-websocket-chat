import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  createdAt: Date
});
const Message = mongoose.model("Message", messageSchema);
export default Message;
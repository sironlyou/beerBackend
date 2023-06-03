import { model, Schema } from "mongoose";
const messageSchema = new Schema({
  conversation: { type: String },
  senderId: { type: String },
  body: { type: String },
  media: { type: [String] },
  createdAt: { type: String },
  updatedAt: { type: String },
  readBy: { type: [String], default: [] },
  visibleFor: { type: [String] },
});
module.exports = model("Message", messageSchema);

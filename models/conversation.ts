import { model, Schema } from "mongoose";
const conversationSchema = new Schema({
  participants: { type: [String] },
  messages: { type: [String], default: [] },
  visibleFor: { type: [String] },
});
module.exports = model("Conversation", conversationSchema);

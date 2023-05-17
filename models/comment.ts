import { model, Schema } from "mongoose";
const commentSchema = new Schema({
  body: { type: String, required: true },
  author: { type: String },
  createdAt: { type: String },
  postId: { type: String },
});
module.exports = model("Comment", commentSchema);

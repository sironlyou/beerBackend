import { model, Schema } from "mongoose";
const tokenSchema = new Schema({
  authToken: { type: String },
  userId: { type: String },
});
module.exports = model("userToken", tokenSchema);

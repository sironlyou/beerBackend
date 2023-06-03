import { model, Schema } from "mongoose";
const userSchema = new Schema({
  username: { type: String, unique: true },
  password: { type: String, required: true },
  email: { type: String, unique: true },
  avatar: { type: String },
  dateOfBirth: { type: String },
  sentRequests: { type: [String], default: [] },
  incomingRequests: { type: [String], default: [] },
  friends: { type: [String], default: [] },
  karma: { type: String, default: "0" },
});
module.exports = model("User", userSchema);
//@ts-ignore
// const post = [
//   "author",
//   "createdAt",
//   "beerName",
//   "reviewBody",
//   "alcohol",
//   "rating",
//   "price /5",
//   "alcohol/5",
//   "quality/5",
//   "taste",
//   "image",
// ];

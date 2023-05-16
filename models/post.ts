import { model, Schema } from "mongoose";
const postSchema = new Schema({
  author: { type: String },
  createdAt: { type: String },
  origin: { type: String },
  alcohol: { type: String },
  value: { type: String },
  price: { type: String },
  taste: { type: String },
  quality: { type: String },
  alcoholHit: { type: String },
  beerName: { type: String },
  reviewBody: { type: String },
  rating: { type: String },
  image: { type: String },
  likesCount: { type: String },
  authorImg: { type: String },
});
module.exports = model("Post", postSchema);
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
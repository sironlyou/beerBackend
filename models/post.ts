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
  authorImg: { type: String },
  likes: { type: [String] },
  comments: { type: [String] },
});
module.exports = model("Post", postSchema);

/*

community:{
  admins:[]
  posts:[id]
  avatar:string
  info:string
  members:[id]
  
}

*/

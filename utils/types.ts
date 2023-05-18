import { Request, Response } from "express";
export interface GraphQLContext {
  req: Request;
  res: Response;
}
export interface User {
  id: string;
  username: string;
  avatar: string;
  email: string;
}
export interface UserLoginData {
  username: string;
  avatar: string;
  id: string;
  email: string;
}
export interface Comment {
  id: string;
  body: string;
  author: string;
  createdAt: string;
  postId: string;
}
export interface IPost {
  id: string;

  author: string;
  createdAt: string;
  origin: string;
  alcohol: string;
  value: string;
  price: string;
  taste: String;
  quality: string;
  alcoholHit: string;
  beerName: string;
  reviewBody: string;
  rating: string;
  image: string;
  authorImg: String;
  likes: string[];
  comments: string[];
}

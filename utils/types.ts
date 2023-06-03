import { Request, Response } from "express";
import { PubSub } from "graphql-subscriptions";
import { Context } from "graphql-ws/lib/server";

export interface GraphQLContext {
  req: Request;
  res: Response;
  pubsub: PubSub;
  userId: string;
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
export interface IConversation {
  id: string;
  participants: [string];
  messages: [string];
  visibleFor: [string];
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
export interface SubscriptionContext {
  pubsub: PubSub;
  req: Request;
}
export interface SubscriptionContext extends Context {
  connectionParams: {
    userId: string;
  };
}

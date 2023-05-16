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
  token: string;
}
export interface UserLoginData {
  username: string;
  avatar: string;
  id: string;
  email: string;
}

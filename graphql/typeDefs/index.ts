import { CommentTypeDefs } from "./comment";
import { ConversationTypeDefs } from "./conversation";
import { MessageTypeDefs } from "./message";
import { PostTypeDefs } from "./post";
import { TypesTypeDefs } from "./types";
import { UserTypeDefs } from "./user";

export const typeDefs = [
  UserTypeDefs,
  ConversationTypeDefs,
  MessageTypeDefs,
  CommentTypeDefs,
  PostTypeDefs,
  TypesTypeDefs,
];

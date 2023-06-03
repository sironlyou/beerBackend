import userResolvers from "./user";
import conversationResolvers from "./conversation";
import merge from "lodash.merge";
import messageResolvers from "./message";
import commentResolvers from "./comment";
import postResolvers from "./post";
const resolvers = merge(
  {},
  userResolvers,
  postResolvers,
  commentResolvers,
  conversationResolvers,
  messageResolvers
);
export default resolvers;

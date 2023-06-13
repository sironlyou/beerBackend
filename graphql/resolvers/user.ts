const Post = require("../../models/post");
const CommentItem = require("../../models/comment");
const Conversation = require("../../models/conversation");
const userToken = require("../../models/token");
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
const User = require("../../models/user");
import jwt_decode from "jwt-decode";
import {
  Comment,
  GraphQLContext,
  IConversation,
  IPost,
  SubscriptionContext,
  User,
  UserLoginData,
} from "../../utils/types";
import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";
const resolvers = {
  Query: {
    getChatParticipant: async (
      _: any,
      args: { conversationId: string },
      context: GraphQLContext
    ) => {
      const { conversationId } = args;
      const { req } = context;
      const user: User = jwt_decode(req.cookies.token);
      const conversation: IConversation = await Conversation.findById({
        _id: conversationId,
      });

      const participantId = conversation.participants.filter(
        (p) => p !== user.id
      );
      return await User.findById({ _id: participantId });
    },
    getUsers: async (_: any, args: { username: string }) => {
      const { username } = args;
      return await User.find({ username: { $regex: username, $options: "i" } });
    },
    getUserInfo: async (_: any, args: { userId: string }) => {
      const { userId } = args;
      return await User.findOne({ username: userId });
    },
    getUser: async (_: any, __: any, context: GraphQLContext) => {
      const { req } = context;
      const user: User = jwt_decode(req.cookies.token);
      return user;
    },
    getFriends: async (
      _: any,
      args: { userId: string },
      context: GraphQLContext
    ) => {
      const { userId } = args;
      const user = await User.findById({ _id: userId });

      const friends = await User.find({ _id: { $in: user.friends } });
      return friends;
    },
  },
  Mutation: {
    sendFriendRequest: async (
      _: any,
      args: { recieverUserId: string },
      context: GraphQLContext
    ) => {
      const { recieverUserId } = args;
      const { req, pubsub } = context;
      const userr: User = jwt_decode(req.cookies.token);
      // const user1 = User.findById({ _id: "6466f98d3d3e8bf6deee1155" });
      // const user2 = User.findById({ _id: recieverUserId });
      const user = await User.findOneAndUpdate(
        { _id: userr.id },
        { $push: { sentRequests: recieverUserId } },
        { new: true }
      );
      const receiver = await User.findOneAndUpdate(
        { _id: recieverUserId },
        { $push: { incomingRequests: userr.id } },
        { new: true }
      );
      pubsub.publish("REQUEST_SENT", { requestSent: user });
      pubsub.publish("REQUEST_ACQUIRED", { requestAcquired: user });

      return receiver;
    },
    acceptFriendRequest: async (
      _: any,
      args: { senderUserId: string },
      context: GraphQLContext
    ) => {
      const { senderUserId } = args;
      const { req, pubsub } = context;
      const userr: User = jwt_decode(req.cookies.token);
      // await User.findOneAndUpdate(
      //   { _id: userr.id },
      //   { $push: { friends: senderUserId } },
      //   { new: true }
      // );
      await User.findOneAndUpdate(
        { _id: userr.id },
        { $push: { friends: senderUserId } },
        { new: true }
      );
      await User.findOneAndUpdate(
        { _id: senderUserId },
        { $push: { friends: userr.id }, new: true }
      );
      await User.findOneAndUpdate(
        { _id: userr.id },
        {
          $pull: {
            incomingRequests: senderUserId,
          },
        },
        { new: true }
      );
      const user = await User.findOneAndUpdate(
        { _id: senderUserId },
        {
          $pull: {
            sentRequests: userr.id,
          },
        },
        { new: true }
      );

      pubsub.publish("INCOMING_REQUEST_APPROVED", {
        incomingRequestApproved: user,
      });
      pubsub.publish("REQUEST_APPROVED", { requestApproved: user });

      return user;
    },
    removeFromFriends: async (
      _: any,
      args: { recieverUserId: string },
      context: GraphQLContext
    ) => {
      const { recieverUserId } = args;
      const { req, pubsub } = context;
      const userr: User = jwt_decode(req.cookies.token);
      await User.findOneAndUpdate(
        { _id: userr.id },
        { $pull: { friends: recieverUserId } },
        { new: true }
      );
      await User.findOneAndUpdate(
        { _id: recieverUserId },
        { $pull: { friends: userr.id }, new: true }
      );
      const user = await User.findOneAndUpdate(
        { _id: userr.id },
        { $push: { incomingRequests: recieverUserId } },

        { new: true }
      );
      const receiver = await User.findOneAndUpdate(
        { _id: recieverUserId },
        { $push: { sentRequests: userr.id } },

        { new: true }
      );
      pubsub.publish("REMOVE_FRIEND", { removeFriend: user });
      pubsub.publish("GET_REMOVED_FROM_FRIENDS", {
        getRemovedFromFriends: user,
      });
      return receiver;
    },
    cancelFriendRequest: async (
      _: any,
      args: { recieverUserId: string },
      context: GraphQLContext
    ) => {
      const { recieverUserId } = args;
      const { req, pubsub } = context;
      const userr: User = jwt_decode(req.cookies.token);

      const user = await User.findOneAndUpdate(
        { _id: userr.id },
        { $pull: { sentRequests: recieverUserId } },
        { new: true }
      );
      const receiver = await User.findOneAndUpdate(
        { _id: recieverUserId },
        { $pull: { incomingRequests: userr.id } },
        { new: true }
      );
      pubsub.publish("SENT_REQUEST_CANCELED", { sentRequestCanceled: user });
      pubsub.publish("INCOMING_REQUEST_CANCELED", {
        incomingRequestCanceled: user,
      });
      return receiver;
    },
    createUser: async (
      _: any,
      args: {
        username: string;
        password: string;
        email: string;
        avatar: string;
        birthDate: string;
      },
      context: GraphQLContext
    ) => {
      const { username, password, email, avatar, birthDate } = args;
      const { req, res } = context;
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new GraphQLError("user exists");
      }
      const encryptedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        avatar,
        email,
        password: encryptedPassword,
        username,
        birthDate,
      });
      const newUser = await user.save();
      const token = jwt.sign(
        { username, email, avatar, id: user._id },
        "access-secret-key",
        {
          expiresIn: "30m",
        }
      );
      const newToken = new userToken({
        userId: user._id,
        authToken: token,
      });
      await newToken.save();

      res.cookie("token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 7,

        httpOnly: true,
      });
      return {
        id: newUser._id,
        ...newUser._doc,
      };
    },
    loginUser: async (
      _: any,
      args: {
        login: string;
        password: string;
      },
      context: GraphQLContext
    ) => {
      const { login, password } = args;
      const { res, req } = context;

      let user;
      login.includes("@")
        ? (user = await User.findOne({ email: login }))
        : (user = await User.findOne({ username: login }));

      if (!user) {
        throw new GraphQLError("User does not exist");
      }
      const isPassEquals = await bcrypt.compare(password, user.password);
      if (!isPassEquals) {
        throw new GraphQLError("INVALID PASSWORD");
      }
      const token = jwt.sign(
        {
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          id: user.id,
        },
        "access-secret-key",
        {
          expiresIn: "30m",
        }
      );
      res.cookie("token", token, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
      // const response = await user.save();
      return {
        id: user.id,
        ...user._doc,
      };
    },
    logoutUser: async (_: any, __: any, context: GraphQLContext) => {
      const { res } = context;

      res.clearCookie("token");
      return true;
    },
  },
  Subscription: {
    requestSent: {
      subscribe: withFilter(
        (_: any, __: any, context: SubscriptionContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["REQUEST_SENT"]);
        },
        (payload, args, context) => {
          if (payload.requestSent.sentRequests.includes(args.recieverUserId))
            return true;
          else return false;
        }
      ),
    },
    requestAcquired: {
      subscribe: withFilter(
        (_: any, __: any, context: SubscriptionContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["REQUEST_ACQUIRED"]);
        },
        (payload, args, context) => {
          return payload.requestAcquired.sentRequests.includes(
            args.recieverUserId
          );
        }
      ),
    },
    requestApproved: {
      subscribe: withFilter(
        (_: any, __: any, context: SubscriptionContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["REQUEST_APPROVED"]);
        },
        (payload, args, context) => {
          //достать айди из контекста а не аргументом
          return payload.requestApproved.friends.includes(args.senderUserId);
        }
      ),
    },
    incomingRequestApproved: {
      subscribe: withFilter(
        (_: any, __: any, context: SubscriptionContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["INCOMING_REQUEST_APPROVED"]);
        },
        (payload, args, context) => {
          return payload.incomingRequestApproved.friends.includes(
            args.senderUserId
          );
        }
      ),
    },
    removeFriend: {
      subscribe: withFilter(
        (_: any, __: any, context: SubscriptionContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["REMOVE_FRIEND"]);
        },
        (payload, args, context) => {
          return payload.requestAcquired.sentRequests.includes(args.id);
        }
      ),
    },
    getRemovedFromFriends: {
      subscribe: withFilter(
        (_: any, __: any, context: SubscriptionContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["GET_REMOVED_FROM_FRIENDS"]);
        },
        (payload, args, context) => {
          return payload.getRemovedFromFriends.incomingRequests.includes(
            args.id
          );
        }
      ),
    },
    sentRequestCanceled: {
      subscribe: withFilter(
        (_: any, __: any, context: SubscriptionContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["SENT_REQUEST_CANCELED"]);
        },
        (payload, args, context) => {
          return payload.sentRequestCanceled.incomingRequests.includes(args.id);
        }
      ),
    },
    incomingRequestCanceled: {
      subscribe: withFilter(
        (_: any, __: any, context: SubscriptionContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["INCOMING_REQUEST_CANCELED"]);
        },
        (payload, args, context) => {
          return payload.incomingRequestCanceled.sentRequests.includes(args.id);
        }
      ),
    },
  },
};
export default resolvers;

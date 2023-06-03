import jwtDecode from "jwt-decode";
import { GraphQLContext, SubscriptionContext, User } from "../../utils/types";
const Message = require("../../models/message");
const Conversation = require("../../models/conversation");
const UserModel = require("../../models/user");

import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";

const resolvers = {
  Query: {
    getMessages: async (
      _: any,
      args: { conversationid: string; participantId: string }
    ) => {
      const { conversationid, participantId } = args;
      const userInfo = await UserModel.findById({ _id: participantId });
      const messages = await Message.find({ conversation: conversationid });
      return {
        messages,
        userInfo,
      };
    },
    getUnreadCount: async (
      _: any,
      args: { conversationId: string },
      context: GraphQLContext
    ) => {
      const { conversationId } = args;
      const { req } = context;
      const user: User = jwtDecode(req.cookies.token);
      const messagesArr = await Message.find({
        conversation: conversationId,
        readBy: { $ne: [user.id] },
      });
      console.log(messagesArr.length);
      return messagesArr.length;
    },
    getLatestMessage: async (_: any, args: { conversationId: string }) => {
      const { conversationId } = args;
      const message = await Message.find({ conversation: conversationId })
        .sort({ createdAt: -1 })
        .limit(1); // 10 latest docs
      console.log(message);
      return message[0];
    },
  },

  Mutation: {
    createMessage: async (
      _: any,
      args: {
        conversationId: string;
        receiverId: string;
        body: string;
        media: [string];
      },
      context: GraphQLContext
    ) => {
      const { body, conversationId, media, receiverId } = args;
      const { pubsub, req } = context;
      // const user: User = req.cookies.token;
      const conversation = await Conversation.findOne({ _id: conversationId });
      if (!conversation.visibleFor.includes("userId"))
        conversation.visibleFor.push("userId");
      await conversation.save();
      if (!conversation) {
        throw new GraphQLError("conversation exists not");
      }
      const msg = new Message({
        conversation: conversationId,
        senderId: "12",
        body: body,
        media: media,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        readBy: ["12"],
        visibleFor: ["12", receiverId],
      });
      const message = await msg.save();
      conversation.messages.push(message._id);
      await conversation.save();
      pubsub.publish("MESSAGE_SENT", { messageSent: message });
      return { message, conversation };
    },
    forwardMessage: async (
      _: any,
      args: { messageId: string; conversationId: string; receiverId: string },
      context: GraphQLContext
    ) => {
      const { pubsub } = context;
      const { conversationId, messageId, receiverId } = args;
      const message = Message.findById({ _id: messageId });
      Message.create({
        conversation: conversationId,
        senderId: message.senderId,
        body: message.body,
        media: message.media,
        createdAt: message.createdAt,
        updatedAt: Date.now(),
        readBy: ["userID"],
        visibleFor: [receiverId, "userID"],
      });
      pubsub.publish("MESSAGE_FORWARDED", { message: message });
      return message;
    },
    editMessage: async (
      _: any,
      args: { id: string; body: string; media: string[] },
      context: GraphQLContext
    ) => {
      const { pubsub } = context;
      const { id, body, media } = args;
      const message = await Message.findById({ _id: id });
      if (body !== "") message.body = body;
      if (media.length !== 0) message.media = media;
      message.updatedAt = Date.now();
      pubsub.publish("MESSAGE_EDITED", { messageEdited: message });
      await message.save();
      return true;
    },
    deleteMessageForMe: async (
      _: any,
      args: { idArr: [string] },
      context: GraphQLContext
    ) => {
      const { pubsub } = context;
      const { idArr } = args;
      console.log(idArr);

      for (let id of idArr) {
        await Message.findOneAndUpdate(
          { _id: id },
          { $pull: { visibleFor: "321" } }
        );
      }
      pubsub.publish("DELETED_MESSAGES_FOR_ME", {
        messagesDeletedForMe: { messages: idArr, userId: "123" },
      });
      return true;
    },
    deleteMessageCompletely: async (
      _: any,
      args: { conversationId: string; idArr: [string] },
      context: GraphQLContext
    ) => {
      const { pubsub } = context;
      const { conversationId, idArr } = args;
      const message = await Message.deleteMany({ _id: idArr });
      const convo = await Conversation.findOneAndUpdate(
        { _id: conversationId },
        { $pull: { messages: { $in: idArr } } },
        { new: true }
      );
      pubsub.publish("MESSAGES_DELETED", {
        messagesDeleted: {
          messages: idArr,
          conversation: convo,
        },
      });

      return true;
    },
  },
  Subscription: {
    messageSent: {
      subscribe: withFilter(
        (_: any, __: any, context: SubscriptionContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["MESSAGE_SENT"]);
        },
        (payload, args, context) => {
          console.log(payload);
          return payload.messageSent.conversation === args.conversationId;
        }
      ),
    },
    messageEdited: {
      subscribe: withFilter(
        (_: any, __: any, context: SubscriptionContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["MESSAGE_EDITED"]);
        },
        (payload, args, context) => {
          console.log(payload);
          return true;
          // return payload.message.visibleFor.includes('123')
        }
      ),
    },
    messagesDeletedForMe: {
      subscribe: withFilter(
        (_: any, __: any, context: SubscriptionContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["DELETED_MESSAGES_FOR_ME"]);
        },
        (payload, args, context) => {
          console.log(payload);
          return true;
          // return payload.userId===userId
        }
      ),
    },
    messagesDeleted: {
      subscribe: withFilter(
        (_: any, __: any, context: SubscriptionContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["MESSAGES_DELETED"]);
        },
        (payload, args, context) => {
          console.log(payload);
          return true;
          payload.conversation.participants.includes("userID");
        }
      ),
    },
  },
};
export default resolvers;

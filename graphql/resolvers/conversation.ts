import jwtDecode from "jwt-decode";
import { GraphQLContext, IConversation, User } from "../../utils/types";
import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";
const Conversation = require("../../models/conversation");
const Message = require("../../models/message");
const UserModel = require("../../models/user");

const resolvers = {
  Query: {
    getAllConversationIds: async (_: any, __: any, context: GraphQLContext) => {
      const { req } = context;
      const user: User = jwtDecode(req.cookies.token);
      const conversations: [IConversation] = await Conversation.find({
        participants: user.id,
      });
      const conversationsArray = conversations.map((convo) => convo.id);
      return conversationsArray;
    },
    getConversationId: async (
      _: any,
      args: { participantId: string },
      context: GraphQLContext
    ) => {
      const { participantId } = args;
      const { req } = context;
      const user: User = jwtDecode(req.cookies.token);
      const conversation = await Conversation.find({
        participants: { $all: [participantId, user.id] },
      });

      return conversation[0];
    },
    getConversations: async (_: any, __: any, context: GraphQLContext) => {
      const { req } = context;
      const user: User = jwtDecode(req.cookies.token);
      const conversations: [IConversation] = await Conversation.find({
        participants: user.id,
      });
      const conversationArray = await Promise.all(
        conversations.map(async (conversation) => {
          const userId = conversation.participants.filter(
            (e: string) => e !== user.id
          );
          const message = await Message.find({ conversation: conversation.id })
            .sort({ createdAt: -1 })
            .limit(1); // 10 latest docs
          const latestMessage = message[0];

          const userItem: User = await UserModel.findById({
            _id: userId[0],
          });

          return { conversation, userItem, latestMessage };
        })
      );
      return conversationArray;
    },
    getConversation: async (
      _: any,
      args: { conversationParticipants: [string] },
      context: GraphQLContext
    ) => {
      const { conversationParticipants } = args;

      const convo = Conversation.findOne({
        participants: conversationParticipants,
      });

      if (!convo) throw new GraphQLError("convo does not exist");
      else return convo;
    },
  },

  Mutation: {
    createConversation: async (
      _: any,
      args: { receiver: string },
      context: GraphQLContext
    ) => {
      const { req, pubsub } = context;

      const { receiver } = args;
      const user: User = jwtDecode(req.cookies.token);
      const participantsArray = [user.id, receiver];
      const conversation = await Conversation.findOne({
        participants: participantsArray,
      });
      const userItem = await UserModel.findById({ _id: receiver });
      if (!conversation) {
        const convo = new Conversation({
          participants: participantsArray,
          visibleFor: participantsArray,
        });

        const conversation = await convo.save();
        pubsub.publish("CONVERSATION_CREATED", {
          conversationCreated: {
            conversation: conversation,
            userItem: userItem,
          },
        });
        return { conversation, userItem };
      } else {
        const message = await Message.find({ conversation: conversation.id })
          .sort({ createdAt: -1 })
          .limit(1); // 10 latest docs
        const latestMessage = message[0];
        return { conversation, userItem, latestMessage };
      }
    },

    deleteConversation: async (
      _: any,
      args: { conversationId: string },
      context: GraphQLContext
    ) => {
      const { conversationId } = args;
      const { pubsub } = context;
      const convo = await Conversation.findById({ _id: conversationId });
      if (!convo) throw new GraphQLError("does not exist");
      const deletedConversation = await Promise.all([
        await Conversation.deleteOne({ _id: conversationId }),

        await Message.deleteMany({ conversation: conversationId }),
      ]);
      const participants = convo.participants;
      pubsub.publish("CONVERSATION_DELETED", {
        conversationDeleted: { participants, conversationId },
      });
      return true;
    },
    deleteConversationForOne: async (
      _: any,
      args: { conversationId: string; userId: string },
      context: GraphQLContext
    ) => {
      const { pubsub, req } = context;
      const { conversationId, userId } = args;
      const user: User = jwtDecode(req.cookies.token);
      const messages = await Message.updateMany(
        { conversation: conversationId },
        { $pull: { visibleFor: user.id } },
        { new: true }
      );
      const convo = await Conversation.findOneAndUpdate(
        { _id: conversationId },
        { $pull: { visibleFor: user.id } }
      );
      pubsub.publish("CONVERSATION_DELETED_FOR_ONE", {
        conversationDeletedForOne: {
          conversation: conversationId,
          userId: user.id,
        },
      });
      return conversationId;
    },
    deleteConversationForEveryone: async (
      _: any,
      args: { conversationId: string },
      context: GraphQLContext
    ) => {
      const { pubsub } = context;
      const { conversationId } = args;
      const convo = await Conversation.findById({ _id: conversationId });

      const conversation = await Conversation.deleteOne({
        _id: conversationId,
      });
      const messages = await Message.deleteMany({
        conversation: conversationId,
      });

      /// return id to remove from cache on frontend?
      pubsub.publish("CONVERSATION_DELETED_FOR_EVERYONE", {
        conversationDeletedForEveryone: {
          conversation: convo.participants,
          conversationId: conversationId,
        },
      });
      return conversationId;
    },
  },
  Subscription: {
    conversationCreated: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["CONVERSATION_CREATED"]);
        },
        (payload, _, context) => {
          const { userId } = context;

          const { conversationCreated } = payload;

          if (conversationCreated.conversation.participants.includes(userId))
            return true;
          else return false;
        }
      ),
    },
    conversationDeletedForOne: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLContext) => {
          const { pubsub } = context;

          return pubsub.asyncIterator(["CONVERSATION_DELETED_FOR_ONE"]);
        },
        (payload, args, context) => {
          const { userId } = context;

          return payload.conversationDeletedForOne.userId === userId;
        }
      ),
    },
    conversationDeletedForEveryone: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["CONVERSATION_DELETED_FOR_EVERYONE"]);
        },
        (payload, args, context) => {
          const { userId } = context;
          return payload.conversationDeletedForEveryone.conversation.includes(
            userId
          );
        }
      ),
    },
  },
};
export default resolvers;

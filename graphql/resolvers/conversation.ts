import jwtDecode from "jwt-decode";
import { GraphQLContext, IConversation, User } from "../../utils/types";
import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";
const Conversation = require("../../models/conversation");
const Message = require("../../models/message");
const UserModel = require("../../models/user");

const resolvers = {
  Query: {
    getConversations: async (_: any, __: any, context: GraphQLContext) => {
      const { req } = context;
      const user: User = jwtDecode(req.cookies.token);
      const conversations: [IConversation] = await Conversation.find({
        participants: user.id,
      });
      console.log(conversations);
      const conversationArray = await Promise.all(
        conversations.map(async (conversation) => {
          const userId = conversation.participants.filter(
            (e: string) => e !== user.id
          );
          console.log("userId", userId);
          const userItem: User = await UserModel.findById({
            _id: userId[0],
          });

          return { conversation, userItem };
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
      // const user: User = jwtDecode(req.cookies.token);
      const participantsArray = [receiver, "321"];
      const convo = await Conversation.findOne({
        participants: participantsArray,
      });

      if (!convo) {
        const conversation = new Conversation({
          participants: participantsArray,
          visibleFor: participantsArray,
        });
        const convo = await conversation.save();

        // console.log("last call", convo);
        pubsub.publish("CONVERSATION_CREATED", {
          conversationCreated: convo,
        });
        return convo;
      } else {
        return convo;
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
      const { pubsub } = context;
      const { conversationId, userId } = args;
      const messages = await Message.updateMany(
        { conversation: conversationId },
        { $pull: { visibleFor: "646b0eca5fe3e878052fa299" } },
        { new: true }
      );
      const convo = await Conversation.findOneAndUpdate(
        { _id: conversationId },
        { $pull: { visibleFor: "646b0eca5fe3e878052fa299" } }
      );
      pubsub.publish("CONVERSATION_DELETED_FOR_ONE", {
        conversationDeletedForOne: {
          conversation: conversationId,
          userId: "646b0eca5fe3e878052fa299",
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
          // const { userId } = context;
          console.log(payload);
          // console.log("id", userId);
          const { conversationCreated } = payload;

          if (conversationCreated.participants.includes("123")) return true;
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
          console.log(payload);
          return (
            payload.conversationDeletedForOne.userId ===
            "646b0eca5fe3e878052fa299"
          );
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
          return true;
          return payload.conversationDeletedForEveryone.conversation.includes(
            "646b0eca5fe3e878052fa299"
          );
        }
      ),
    },
  },
};
export default resolvers;

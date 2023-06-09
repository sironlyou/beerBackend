import gql from "graphql-tag";

export const ConversationTypeDefs = gql`
  type Query {
    getConversation(conversationParticipants: [String]): Conversation
    getConversations: [getConversationsResponse]
    getLatestMessage(conversationId: String): Message
    getConversationId(participantId: String): Conversation
    getAllConversationIds: [String]
  }
  type Mutation {
    deleteConversationForEveryone(conversationId: String): String
    deleteConversationForOne(conversationId: String): String
    deleteConversation(conversationId: String): Boolean
    createConversation(receiver: String): getConversationsResponse
  }
  type Subscription {
    conversationDeletedForEveryone: ConversationDeletedForEveryoneResponse
    conversationCreated: getConversationsResponse
    conversationDeletedForOne: ConversationDeletedForOneResponse
  }
`;

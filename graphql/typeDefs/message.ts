import gql from "graphql-tag";

export const MessageTypeDefs = gql`
  type Query {
    getUnreadCount(conversationId: String): Int
    getMessages(conversationid: String): [Message]
  }
  type Mutation {
    forwardMessage(
      messageId: String
      conversationId: String
      receiverId: String
    ): Message
    readMessage(message: String): Boolean
    deleteMessageForMe(idArr: [String]): Boolean
    deleteMessageCompletely(conversationId: String, idArr: [String]): Boolean
    editMessage(id: String, body: String, media: [String]): Boolean
    createMessage(
      conversationId: String
      body: String
      media: [String]
      receiverId: String
    ): ConvoAndMessage
  }
  type Subscription {
    messageEdited: Message
    messagesDeletedForMe: MessagesDeletedForMeResponse
    messagesDeleted: MessagesDeletedResponse
    messageSent(conversationId: [String]): Message
    messageRead: String
  }
`;

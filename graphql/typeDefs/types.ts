import gql from "graphql-tag";

export const TypesTypeDefs = gql`
  type Comment {
    id: String
    author: String
    body: String
    postId: String
    createdAt: String
  }
  type Post {
    id: String
    author: String
    origin: String
    comments: [String]
    alcohol: String
    value: String
    price: String
    taste: String
    quality: String
    alcoholHit: String
    beerName: String
    reviewBody: String
    rating: String
    image: String
    createdAt: String
    authorImg: String
    likes: [String]
  }
  type Conversation {
    id: String
    participants: [String]
    messages: [String]
    visibleFor: [String]
  }
  type Message {
    id: String
    conversation: String
    senderId: String
    body: String
    media: [String]
    createdAt: String
    updatedAt: String
    readBy: [String]
    visibleFor: [String]
  }
  type MessagesDeletedResponse {
    messages: [String]
    conversation: Conversation
  }
  type MessagesDeletedForMeResponse {
    messages: [String]
    userId: String
  }
  type ConversationDeletedForOneResponse {
    conversation: String
    userId: String
  }
  type ConversationDeletedForEveryoneResponse {
    conversation: [String]
    conversationId: String
  }

  type ConvoAndMessages {
    message: [Message]
    conversation: Conversation
  }
  type ConvoAndMessage {
    message: Message
    conversation: Conversation
  }
  type getMessagesResponse {
    messages: [Message]
    userInfo: User
  }
  type User {
    password: String
    email: String
    username: String
    avatar: String
    id: String
    birthdate: String
    incomingRequests: [String]
    sentRequests: [String]
    friends: [String]
    karma: String
  }
  type getCommentsResponse {
    comment: Comment
    user: User
  }
  type getConversationsResponse {
    conversation: Conversation
    userItem: User
    latestMessage: Message
  }
  type createPostResponse {
    user: User
    post: Post
  }
  type ConversationDeletedResponse {
    participants: [String]
    conversationId: String
  }

  type Token {
    authToken: String
    userId: String
  }
  type createCommentResponse {
    user: User
    comment: Comment
  }
`;

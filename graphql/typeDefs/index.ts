import gql from "graphql-tag";

export const typeDefs = gql`
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
  type Subscription {
    conversationDeletedForEveryone: ConversationDeletedForEveryoneResponse
    conversationCreated: Conversation
    conversationDeletedForOne: ConversationDeletedForOneResponse
    messageEdited: Message
    messagesDeletedForMe: MessagesDeletedForMeResponse
    messagesDeleted: MessagesDeletedResponse
    requestSent(recieverUserId: String): User
    requestAcquired(recieverUserId: String): User
    requestApproved(senderUserId: String): User
    incomingRequestApproved(senderUserId: String): User
    removeFriend(id: String): User
    getRemovedFromFriends(id: String): User
    sentRequestCanceled(id: String): User
    incomingRequestCanceled(id: String): User
    messageSent(conversationId: String): Message
  }
  type Query {
    getUnreadCount(conversationId: String): Int
    getConversation(conversationParticipants: [String]): Conversation
    getMessages(
      conversationid: String
      participantId: String
    ): getMessagesResponse
    getConversations: [getConversationsResponse]
    getUserPosts(userId: String): [createPostResponse]
    getUserInfo(userId: String): User
    getUsers(username: String): [User]
    getPosts(amount: Int): [createPostResponse]
    getUser: User
    getComments(postId: String): [getCommentsResponse]
    getLatestMessage(conversationId: String): Message
  }

  type Mutation {
    forwardMessage(
      messageId: String
      conversationId: String
      receiverId: String
    ): Message
    deleteConversationForEveryone(conversationId: String): String
    deleteConversationForOne(conversationId: String): String
    deleteMessageForMe(idArr: [String]): Boolean
    deleteMessageCompletely(conversationId: String, idArr: [String]): Boolean
    editMessage(id: String, body: String, media: [String]): Boolean
    deleteConversation(conversationId: String): Boolean
    createMessage(
      conversationId: String
      body: String
      media: [String]
      receiverId: String
    ): ConvoAndMessage
    createConversation(receiver: String): Conversation
    cancelFriendRequest(recieverUserId: String): Boolean
    removeFromFriends(recieverUserId: String): Boolean
    sendFriendRequest(recieverUserId: String): Boolean
    acceptFriendRequest(senderUserId: String): Boolean
    createComment(
      author: String
      body: String
      postId: String
    ): createCommentResponse
    likedPost(postId: String): Post
    dislikedPost(postId: String): Post
    createUser(
      username: String!
      password: String!
      email: String!
      avatar: String!
    ): User
    loginUser(login: String!, password: String!): User
    logoutUser: Boolean
    createPost(
      author: String
      origin: String
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
      authorImg: String
    ): createPostResponse
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

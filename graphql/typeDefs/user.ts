import gql from "graphql-tag";

export const UserTypeDefs = gql`
  type Query {
    getFriends(userId: String): [User]
    getUserInfo(userId: String): User
    getUsers(username: String): [User]
    getChatParticipant(conversationId: String): User
    getUser: User
  }
  type Mutation {
    cancelFriendRequest(recieverUserId: String): User
    removeFromFriends(recieverUserId: String): User
    sendFriendRequest(recieverUserId: String): User
    acceptFriendRequest(senderUserId: String): User
    createUser(
      username: String!
      password: String!
      email: String!
      avatar: String!
    ): User
    loginUser(login: String!, password: String!): User
    logoutUser: Boolean
  }
  type Subscription {
    requestSent(recieverUserId: String): User
    requestAcquired(recieverUserId: String): User
    requestApproved(senderUserId: String): User
    incomingRequestApproved(senderUserId: String): User
    removeFriend(id: String): User
    getRemovedFromFriends(id: String): User
    sentRequestCanceled(id: String): User
    incomingRequestCanceled(id: String): User
  }
`;

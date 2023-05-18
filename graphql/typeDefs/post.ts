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
  type User {
    password: String
    email: String
    username: String
    avatar: String
    id: String
  }
  type getCommentsResponse {
    comment: Comment
    user: User
  }
  type createPostResponse {
    user: User
    post: Post
  }
  type Query {
    getPosts(amount: Int): [createPostResponse]
    getUser: User
    getComments(postId: String): [getCommentsResponse]
  }
  type Token {
    authToken: String
    userId: String
  }
  type createCommentResponse {
    user: User
    comment: Comment
  }
  type Mutation {
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
`;

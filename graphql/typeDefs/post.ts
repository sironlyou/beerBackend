import gql from "graphql-tag";

export const typeDefs = gql`
  type Query {
    greetings: String
  }
  type Post {
    id: String
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
    createdAt: String
    authorImg: String
    likes: [String]
  }
  type User {
    password: String
    email: String
    username: String
    token: String
    avatar: String
    id: String
  }
  type Query {
    getPosts(amount: Int): [Post]
    getUser: User
  }
  type Mutation {
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
    ): [Post]
  }
`;

import gql from "graphql-tag";

export const PostTypeDefs = gql`
  type Query {
    getUserPosts(userId: String): [createPostResponse]
    getPosts(amount: Int): [createPostResponse]
  }
  type Mutation {
    likedPost(postId: String): Post
    dislikedPost(postId: String): Post

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

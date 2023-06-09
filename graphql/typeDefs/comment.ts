import gql from "graphql-tag";

export const CommentTypeDefs = gql`
  type Query {
    getComments(postId: String): [getCommentsResponse]
  }
  type Mutation {
    createComment(
      author: String
      body: String
      postId: String
    ): createCommentResponse
  }
`;

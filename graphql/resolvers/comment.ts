const CommentItem = require("../../models/comment");
const Post = require("../../models/post");

const User = require("../../models/user");
import {
  Comment,
  GraphQLContext,
  IPost,
  User,
  UserLoginData,
} from "../../utils/types";
const resolvers = {
  Query: {
    getComments: async (
      _: any,
      args: { postId: string },
      context: GraphQLContext
    ) => {
      const { postId } = args;
      const comments: [Comment] = await CommentItem.find({ postId: postId });
      // const user = await User.findById({ _id: comments.author });
      const newCommentsArr = await Promise.all(
        comments.map(async (comment) => {
          const user = await User.findById({ _id: comment.author });
          return { comment, user };
        })
      );
      // const arr =  newCommentsArr;
      return newCommentsArr;
    },
  },
  Mutation: {
    createComment: async (
      _: any,
      args: { postId: string; author: string; body: string },
      context: GraphQLContext
    ) => {
      const { postId, body, author } = args;
      const { req, res } = context;
      const newComment = new CommentItem({
        author,
        body,
        postId,
        createdAt: Date.now(),
      });
      const comment = await newComment.save();
      await Post.findOneAndUpdate(
        { _id: postId },
        { $push: { comments: newComment._id } },
        { new: true }
      );
      const user = await User.findById({ _id: author });

      return { comment, user };
    },
  },
};
export default resolvers;

// GraphQL Resolvers
const Post = require("../../models/post");
const User = require("../../models/user");
const CommentItem = require("../../models/comment");
const userToken = require("../../models/token");
import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import jwt_decode from "jwt-decode";
import {
  Comment,
  GraphQLContext,
  IPost,
  User,
  UserLoginData,
} from "../../utils/types";

const resolvers = {
  Query: {
    getUserPosts: async (_: any, args: { userId: string }) => {
      const { userId } = args;
      const user = await User.findOne({ username: userId });
      const posts: [IPost] = await Post.find({ author: user.id });
      const postsArr = await Promise.all(
        posts.map(async (post) => {
          return { post, user };
        })
      );
      return postsArr;
    },

    getPosts: async (_: any) => {
      const posts: [IPost] = await Post.find();
      const postsArr = await Promise.all(
        posts.map(async (post) => {
          const user = await User.findById({ _id: post.author });
          return { post, user };
        })
      );
      return postsArr;
    },
  },
  Mutation: {
    likedPost: async (
      _: any,
      args: {
        postId: string;
      },
      context: GraphQLContext
    ) => {
      const { postId } = args;
      const { req } = context;
      const user: User = jwt_decode(req.cookies.token);
      const post = Post.findOne({ _id: postId });
      const likesArr = post.likes;
      console.log(likesArr);
      const likedPost = await Post.findOneAndUpdate(
        { _id: postId },
        { $push: { likes: user.username } },
        { new: true }
      );
      return likedPost;
    },
    dislikedPost: async (
      _: any,
      args: {
        postId: string;
      },
      context: GraphQLContext
    ) => {
      const { postId } = args;
      const { req } = context;
      const user: User = jwt_decode(req.cookies.token);
      const post = Post.findOne({ _id: postId });
      const likesArr = post.likes;
      const dislikedPost = await Post.findOneAndUpdate(
        { _id: postId },
        { $pull: { likes: user.username } },
        { new: true }
      );
      return dislikedPost;
      // const likedPost = await Post.findOne({ _id: postId });
      console.log(dislikedPost);
    },
    createPost: async (
      _: any,
      args: {
        author: string;
        origin: string;
        alcohol: string;
        value: string;
        price: string;
        taste: string;
        quality: string;
        alcoholHit: string;
        beerName: string;
        reviewBody: string;
        rating: string;
        image: string;
        authorImg: string;
      }
    ) => {
      const {
        author,
        origin,
        alcohol,
        value,
        price,
        taste,
        quality,
        alcoholHit,
        beerName,
        reviewBody,
        rating,
        image,
        authorImg,
      } = args;
      const newPost = new Post({
        author,
        origin,
        alcohol,
        value,
        price,
        taste,
        quality,
        alcoholHit,
        beerName,
        reviewBody,
        authorImg,
        rating,
        image,
        likes: [],
        createdAt: Date.now(),
      });
      const user = await User.findById({ _id: author });

      const post = await newPost.save();
      return { post, user };
    },
  },
};

export default resolvers;

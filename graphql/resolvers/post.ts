// GraphQL Resolvers
const Post = require("../../models/post");
const User = require("../../models/user");
const CommentItem = require("../../models/comment");
const Token = require("./user");
import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import jwt_decode from "jwt-decode";
import { GraphQLContext, User, UserLoginData } from "../../utils/types";

export const resolvers = {
  Query: {
    getComments: async (
      _: any,
      args: { postId: string },
      context: GraphQLContext
    ) => {
      const { postId } = args;
      const comments = await CommentItem.find({ postId: postId });
      return comments;
    },
    getPosts: async (_: any) => {
      //   const posts = await Post.find();

      return await Post.find();
    },
    getUser: async (_: any, __: any, context: GraphQLContext) => {
      const { req } = context;
      const user: User = jwt_decode(req.cookies.token);
      return user;
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
      const comment = new CommentItem({
        author,
        body,
        postId,
        createdAt: new Date(),
      });
      const result = await comment.save();
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        { $push: { comments: comment._id } },
        { new: true }
      );

      return result;
    },
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
        createdAt: new Date(),
      });
      const res = await newPost.save();
      return res;
    },
    createUser: async (
      _: any,
      args: {
        username: string;
        password: string;
        email: string;
        avatar: string;
      },
      context: GraphQLContext
    ) => {
      const { username, password, email, avatar } = args;
      const { req, res } = context;
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new GraphQLError("user exists");
      }
      const encryptedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        avatar,
        email,
        password: encryptedPassword,
        username,
      });
      const newUser = await user.save();
      console.log(newUser._id);
      const token = jwt.sign(
        { username, email, avatar, id: user._id },
        "access-secret-key",
        {
          expiresIn: "30m",
        }
      );
      const newToken = new Token({
        userId: user._id,
        authToken: token,
      });
      await newToken.save();

      res.cookie("token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 7,

        httpOnly: true,
      });
      return {
        id: newUser.id,
        ...newUser._doc,
      };
    },
    loginUser: async (
      _: any,
      args: {
        login: string;
        password: string;
      },
      context: GraphQLContext
    ) => {
      const { login, password } = args;
      const { res, req } = context;

      let user;
      login.includes("@")
        ? (user = await User.findOne({ email: login }))
        : (user = await User.findOne({ username: login }));

      if (!user) {
        throw new GraphQLError("User does not exist");
      }
      const isPassEquals = await bcrypt.compare(password, user.password);
      if (!isPassEquals) {
        throw new GraphQLError("INVALID PASSWORD");
      }
      const token = jwt.sign(
        {
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          userid: user.id,
        },
        "access-secret-key",
        {
          expiresIn: "30m",
        }
      );
      res.cookie("token", token, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
      return true;
    },
    logoutUser: async (_: any, __: any, context: GraphQLContext) => {
      const { res } = context;

      res.clearCookie("token");
      return true;
    },
  },
};

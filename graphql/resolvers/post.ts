// GraphQL Resolvers
const Post = require("../../models/post");
const User = require("../../models/user");
import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import jwt_decode from "jwt-decode";
import { GraphQLContext, User, UserLoginData } from "../../utils/types";

export const resolvers = {
  Query: {
    getPosts: async (_: any) => {
      //   const posts = await Post.find();

      return await Post.find();
    },
    getUser: async (_: any, __: any, context: GraphQLContext) => {
      const { req } = context;
      const user: User = jwt_decode(req.cookies.token);
      const username = user.id;
      console.log(user);
      return user;
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
      await newPost.save();
      return Post.find();
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
      const token = jwt.sign({ username, email, avatar }, "access-secret-key", {
        expiresIn: "30m",
      });

      const user = await User({
        avatar,
        email,
        password: encryptedPassword,
        username,
        token,
      });

      res.cookie("token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 7,

        httpOnly: true,
      });
      const response = await user.save();
      return {
        id: response.id,
        ...response._doc,
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
        { username: user.username, email: user.email, avatar: user.avatar },
        "access-secret-key",
        {
          expiresIn: "30m",
        }
      );
      res.cookie("token", token, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
      user.token = token;
      const response = await user.save();
      return {
        id: response.id,
        ...response._doc,
      };
    },
    logoutUser: async (_: any, __: any, context: GraphQLContext) => {
      const { res } = context;

      res.clearCookie("token");
      return true;
    },
  },
};

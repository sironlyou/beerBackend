import express from "express";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import cors from "cors";
import resolvers from "./graphql/resolvers/";
import mongoose, { ConnectOptions } from "mongoose";
import { typeDefs } from "./graphql/typeDefs/index";
import { GraphQLContext, SubscriptionContext } from "./utils/types";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";
import { createServer } from "http";
import * as dotenv from "dotenv";
import multer from "multer";
import bodyParser, { json } from "body-parser";
import cookieParser from "cookie-parser";

import { useServer } from "graphql-ws/lib/use/ws";
import { WebSocketServer } from "ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { PubSub } from "graphql-subscriptions";
// import { GraphQLContext, SubscriptionContext } from "../utils/types";

const EasyYandexS3 = require("easy-yandex-s3").default;
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

const MONGODB =
  "mongodb+srv://sironlyou:a2251616A@cluster0.0i70xle.mongodb.net/?retryWrites=true&w=majority";
const main = async () => {
  const port = 4000;
  dotenv.config();
  const app = express();
  const httpServer = createServer(app);
  app.use(cookieParser());
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/subscriptions",
  });
  const pubsub = new PubSub();

  mongoose
    .connect(
      "mongodb+srv://sironlyou:a2251616A@cluster0.0i70xle.mongodb.net/?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as ConnectOptions
    )
    .then(() => {
      console.log(`Db Connected`);
    })
    .catch((err) => {
      console.log(err.message);
    });

  let s3 = new EasyYandexS3({
    auth: {
      secretAccessKey: process.env.SECRET_ACCESS,
      accessKeyId: process.env.ACCESS_KEY,
    },
    Bucket: "boost.img", // например, "my-storage",
    debug: true, // Дебаг в консоли, потом можете удалить в релизе
  });
  const getSubscriptionContext = async (ctx: SubscriptionContext) => {
    ctx;
    if (ctx.connectionParams && ctx.connectionParams.userId) {
      const { userId } = ctx.connectionParams;
      return { userId, pubsub };
    }
    return { token: null, pubsub };
  };
  const serverCleanup = useServer(
    {
      schema,

      context: (ctx: SubscriptionContext) => {
        return getSubscriptionContext(ctx);
      },
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    csrfPrevention: true,

    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),

      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });
  await server.start();

  const corsOptions = {
    origin: "http://localhost:3000",

    credentials: true,
  };

  app.use(multer().any(), cors<cors.CorsRequest>(corsOptions));
  app.post("/uploadFile", async (req, res) => {
    //@ts-ignore
    if (typeof req.files === "undefined") return;
    //@ts-ignore
    let buffer: Buffer = req.files[0].buffer; // Буфер загруженного файла
    let upload = await s3.Upload({ buffer }, "/files/"); // Загрузка в бакет
    res.send(upload); // Ответ сервера - ответ от Yandex Object Storage
  });

  app.use(
    "/",
    cors<cors.CorsRequest>(corsOptions),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return { req, res, pubsub };
      },
    })
  );

  await new Promise<void>((resolve) => httpServer.listen(port, resolve));
  console.log(`Server is now running on http://localhost:${port}/`);
};

main().catch((err) => console.log(err));

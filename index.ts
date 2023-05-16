import express from "express";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import cors from "cors";
import { resolvers } from "./graphql/resolvers/post";
import mongoose, { ConnectOptions } from "mongoose";
import { typeDefs } from "./graphql/typeDefs/post";
import { GraphQLContext } from "./utils/types";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";
import { createServer } from "http";
import * as dotenv from "dotenv";
import multer from "multer";
import bodyParser, { json } from "body-parser";
import cookieParser from "cookie-parser";
const EasyYandexS3 = require("easy-yandex-s3").default;


// startStandaloneServer(server, {
//   listen: { port: 4000 },context:async({req,res})=>{
//     return {req,res}
//   }

//   }
// ,}).then(({ url }) => {
//   console.log(`Server ready at ${url}`);
// });

const main = async () => {
  const port = 4000;
  mongoose
    .connect(process.env.MONGO_URI as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions)
    .then(() => {
      console.log(`Db Connected`);
    })
    .catch((err) => {
      console.log(err.message);
    });

  dotenv.config();
  // Create the schema, which will be used separately by ApolloServer and
  // the WebSocket server.

  const app = express();
  const httpServer = createServer(app);
  app.use(cookieParser());

  let s3 = new EasyYandexS3({
    auth: {
      secretAccessKey: process.env.SECRET_ACCESS,
      accessKeyId: process.env.ACCESS_KEY,
    },
    Bucket: "boost.img", // например, "my-storage",
    debug: true, // Дебаг в консоли, потом можете удалить в релизе
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
  });
  await server.start();

  const corsOptions = {
    origin: process.env.CLIENT_ORIGIN,

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
        return { req, res };
      },
    })
  );

  // Now that our HTTP server is fully set up, we can listen to it.
  await new Promise<void>((resolve) => httpServer.listen(port, resolve));
  console.log(`Server is now running on http://localhost:${port}/`);
};

main().catch((err) => console.log(err));

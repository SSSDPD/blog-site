import { ApolloServer } from "apollo-server-express";
import "reflect-metadata";
import express from "express";
import { buildSchema } from "type-graphql";
import { COOKIE_NAME, __prod__ } from "./constants";
import { UserResolver } from "./resolvers/user";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import { FeatureImageResolver } from "./resolvers/featureImage";
import { graphqlUploadExpress } from "graphql-upload";
import { Upvote } from "./entities/Upvote";
import path from "path";

const main = async () => {
  const conn = createConnection({
    type: "postgres",
    database: "blogsite2",
    password: "postgres",
    username: "postgres",
    logging: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    synchronize: true,
    entities: [User, Post, Upvote],
  });

  (await conn).runMigrations();

  // await Post.delete({});

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();
  app.use(cors({ origin: "http://localhost:3000", credentials: true }));
  app.use(
    "/graphql",
    graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 })
  );
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTTL: true,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__,
      },
      saveUninitialized: false,
      secret: "bokachoda", //need to put this in env file
      resave: false,
    })
  );

  const schema = await buildSchema({
    resolvers: [
      HelloResolver,
      PostResolver,
      UserResolver,
      FeatureImageResolver,
    ],
    validate: false,
  });

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res, redis }),
    uploads: false,
  });
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log("server started on http://localhost:4000/graphql");
  });
};

main().catch((error) => {
  console.log(error);
});

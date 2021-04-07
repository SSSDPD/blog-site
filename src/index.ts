import { ApolloServer } from "apollo-server-express";
import "reflect-metadata";
import Express from "express";
import { buildSchema } from "type-graphql";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";
// import { RegisterResolver } from "./resolvers/register";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const schema = await buildSchema({
    resolvers: [HelloResolver, PostResolver],
    validate: false,
  });
  const apolloServer = new ApolloServer({
    schema,
    context: () => ({ em: orm.em }),
  });

  const app = Express();

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("server started on http://localhost:4000/graphql");
  });
};

main().catch((error) => {
  console.log(error);
});

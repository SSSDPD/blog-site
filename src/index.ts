import { ApolloServer } from "apollo-server-express";
import "reflect-metadata";
import Express from "express";
import { buildSchema, Query, Resolver } from "type-graphql";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";

@Resolver()
class HelloResolver {
  @Query(() => String)
  async hello() {
    return "Hello Graphql";
  }
}

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();
  // const post = orm.em.create(Post, {
  //   title: "First Post",
  // }); //creates the post with a specific title

  // await orm.em.persistAndFlush(post); //adds the post to the database

  // const posts = await orm.em.find(Post, {});
  // console.log(posts);

  const schema = await buildSchema({
    resolvers: [HelloResolver],
  });
  const apolloServer = new ApolloServer({ schema });

  const app = Express();

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("server started on http://localhost:4000/graphql");
  });
};

main().catch((error) => {
  console.log(error);
});

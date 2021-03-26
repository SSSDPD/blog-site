// import { ApolloServer } from "apollo-server-express";
// import "reflect-metadata";
// import Express from "express";
// import { buildSchema, Query, Resolver } from "type-graphql";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";

// @Resolver()
// class HelloResolver {
//   @Query(() => String)
//   async hello() {
//     return "Hello Graphql";
//   }
// }

const main = async () => {
  const orm = await MikroORM.init({
    entities: [Post],
    dbName: "blogsite",
    type: "postgresql",
    debug: !__prod__,
  });

  const post = orm.em.create(Post, {
    title: "First Post",
  }); //creates the post with a specific title

  orm.em.persistAndFlush(post); //adds the post to the database

  // const schema = await buildSchema({
  //   resolvers: [HelloResolver],
  // });
  // const apolloServer = new ApolloServer({ schema });

  // const app = Express();

  // apolloServer.applyMiddleware({ app });

  // app.listen(4000, () => {
  //   console.log("server started on http://localhost:4000/graphql");
  // });
};

main();

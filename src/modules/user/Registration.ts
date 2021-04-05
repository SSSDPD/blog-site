import { Resolver, Query, Mutation } from 'type-graphql';
@Resolver()
export class RegisterResolver {
  @Query(() => String)
  async hello() {
    return "Hello Graphql";
  }

  @Mutation(() => String)
  async register() {
    return "user registration";
  }
}
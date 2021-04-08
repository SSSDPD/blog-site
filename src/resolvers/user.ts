import { User } from '../entities/User';
import { Resolver, Mutation, Arg, Ctx, Query } from "type-graphql";
import * as bcrypt from "bcryptjs";
import { MyContext } from '../types';

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async registerUser(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Arg("firstName") firstName: string,
    @Arg("lastName") lastName: string,
    @Arg("username") username: string,
    @Ctx() ctx: MyContext
  ): Promise<User> {
    const hashedPass = await bcrypt.hash(password, 10);

    const user = ctx.em.create(User, 
      {email, 
      password: hashedPass,
      firstName,
      lastName,
      username});
    
    await ctx.em.persistAndFlush(user);
    return user;
  }

  @Query(()=> User, { nullable: true })
  findUser(@Arg("id") id: number, @Ctx() ctx: MyContext): Promise<User | null> {
    return ctx.em.findOne(User, { id });
  }

  // @Mutation(() => User, { nullable: true })
  // async updateUser(
  //   @Arg("id") id: number,
  //   @Arg("username", () => String, { nullable: true }) username: string,
  //   @Arg("password", () => String, { nullable: true }) password: string,
  //   @Ctx() ctx: MyContext
  // ): Promise<User | null> {
  //   const user = await ctx.em.findOne(User, { id });
  //   if (!user) return null;

  //   if (typeof title !== "undefined") {
  //     user.title = title;
  //     await ctx.em.persistAndFlush(user);
  //   }

  //   return user;
  // }

  // @Mutation(() => String)
  // async deletePost(
  //   @Arg("id") id: number,
  //   @Ctx() ctx: MyContext
  // ): Promise<string> {
  //   await ctx.em.nativeDelete(User, { id });
  //   return "User successfully deleted";
  // }
}

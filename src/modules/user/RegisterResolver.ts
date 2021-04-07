import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import * as bcrypt from 'bcryptjs';

import { User } from '../../entities/User';

@Resolver()
export class RegisterResolver {
  @Query(() => String)
  async hello() {
    return "Hello Graphql";
  }

  @Mutation(() => User)
  async register(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Arg('firstName') firstName: string,
    @Arg('lastName') lastName: string,
  ): Promise<User> {
    const hashedPass = await bcrypt.hash(password, 10);

    const user = new User();
    user.email = email;
    user.password = hashedPass;
    user.firstName = firstName;
    user.lastName = lastName;

    

    return user;
  }
}